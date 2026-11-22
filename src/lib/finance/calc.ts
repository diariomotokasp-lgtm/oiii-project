import { toCents, type Cents } from "./money";
import { addMonths, endOfMonth, makeISO, monthKey, monthRange, parseISO, startOfMonth } from "./dates";
import type { CreditCard, FinanceData, Investment, Transaction } from "./types";

/**
 * Accounting rules (single source of truth):
 * 1. Transfers move money between accounts; never income or expense.
 * 2. Card purchases are expenses on purchase date; invoice payments only move cash.
 * 3. Investment buys/sells move cash; never consumption expenses.
 * 4. Asset appreciation changes net worth, never income.
 * 5. Dividends are income once, through their linked transaction.
 * 6. Student check-ins never create income; only payments do.
 * 7. "Realized" = status realized AND dated on/before today. Everything else is projected.
 */

export function isRealized(t: Pick<Transaction, "status" | "occurred_on">, today: string): boolean {
  return t.status === "realized" && t.occurred_on <= today;
}

function movementCash(m: { kind: string; quantity: number; unit_price: number; fees: number }): Cents {
  const gross = Math.round(Number(m.quantity) * Number(m.unit_price) * 100);
  const fees = toCents(m.fees);
  return m.kind === "buy" ? -(gross + fees) : gross - fees;
}

/** Balance of each account on a given date (inclusive). */
export function accountBalances(data: FinanceData, asOf: string): Map<string, Cents> {
  const map = new Map<string, Cents>();
  for (const a of data.accounts) map.set(a.id, toCents(a.initial_balance));
  const add = (id: string | null, v: Cents) => {
    if (!id || !map.has(id)) return;
    map.set(id, (map.get(id) ?? 0) + v);
  };
  for (const t of data.transactions) {
    if (!t.account_id || t.card_id) continue;
    if (!isRealized(t, asOf)) continue;
    add(t.account_id, t.kind === "income" ? toCents(t.amount) : -toCents(t.amount));
  }
  for (const tr of data.transfers) {
    if (tr.transferred_on > asOf) continue;
    add(tr.from_account_id, -toCents(tr.amount));
    add(tr.to_account_id, toCents(tr.amount));
  }
  for (const p of data.invoice_payments) {
    if (p.paid_on > asOf) continue;
    add(p.account_id, -toCents(p.amount));
  }
  for (const m of data.investment_movements) {
    if (m.moved_on > asOf) continue;
    add(m.account_id, movementCash(m));
  }
  return map;
}

export function totalCash(data: FinanceData, asOf: string): Cents {
  let sum = 0;
  for (const v of accountBalances(data, asOf).values()) sum += v;
  return sum;
}

export interface PeriodTotals {
  income: Cents;
  expense: Cents;
  plannedIncome: Cents;
  plannedExpense: Cents;
}

/** Income/expense in a date range. Realized vs projected kept apart. Pending bills count as projected. */
export function periodTotals(data: FinanceData, from: string, to: string, today: string): PeriodTotals {
  const r: PeriodTotals = { income: 0, expense: 0, plannedIncome: 0, plannedExpense: 0 };
  for (const t of data.transactions) {
    if (t.occurred_on < from || t.occurred_on > to) continue;
    const v = toCents(t.amount);
    const realized = isRealized(t, today);
    if (t.kind === "income") realized ? (r.income += v) : (r.plannedIncome += v);
    else realized ? (r.expense += v) : (r.plannedExpense += v);
  }
  for (const b of data.bills) {
    if (b.status !== "pending" || b.due_date < from || b.due_date > to) continue;
    if (b.kind === "receivable") r.plannedIncome += toCents(b.amount);
    else r.plannedExpense += toCents(b.amount);
  }
  return r;
}

// ---------- Credit cards ----------

/** Invoice month (YYYY-MM) a purchase belongs to: purchases after the closing day go to next month's invoice. */
export function invoiceMonthFor(purchaseISO: string, closingDay: number): string {
  const { d } = parseISO(purchaseISO);
  return d > closingDay ? monthKey(addMonths(startOfMonth(purchaseISO), 1)) : monthKey(purchaseISO);
}

export function invoiceDueDate(month: string, card: Pick<CreditCard, "closing_day" | "due_day">): string {
  const [y, m] = month.split("-").map(Number);
  const base = makeISO(y ?? 1970, m ?? 1, card.due_day);
  return card.due_day <= card.closing_day ? addMonths(base, 1) : base;
}

export interface Invoice {
  cardId: string;
  month: string;
  total: Cents;
  paid: Cents;
  open: Cents;
  dueDate: string;
  closingDate: string;
  status: "open" | "closed" | "paid" | "overdue";
  items: Transaction[];
}

export function cardInvoices(data: FinanceData, card: CreditCard, today: string): Invoice[] {
  const byMonth = new Map<string, Transaction[]>();
  for (const t of data.transactions) {
    if (t.card_id !== card.id) continue;
    const m = invoiceMonthFor(t.occurred_on, card.closing_day);
    const list = byMonth.get(m) ?? [];
    list.push(t);
    byMonth.set(m, list);
  }
  const paidByMonth = new Map<string, Cents>();
  for (const p of data.invoice_payments) {
    if (p.card_id !== card.id) continue;
    const m = monthKey(p.reference_month);
    paidByMonth.set(m, (paidByMonth.get(m) ?? 0) + toCents(p.amount));
    if (!byMonth.has(m)) byMonth.set(m, []);
  }
  const out: Invoice[] = [];
  for (const [month, items] of byMonth) {
    const total = items.reduce((s, t) => s + toCents(t.amount), 0);
    const paid = paidByMonth.get(month) ?? 0;
    const open = Math.max(0, total - paid);
    const [y, m] = month.split("-").map(Number);
    const closingDate = makeISO(y ?? 1970, m ?? 1, card.closing_day);
    const dueDate = invoiceDueDate(month, card);
    let status: Invoice["status"] = "open";
    if (total > 0 && open === 0) status = "paid";
    else if (today > dueDate && open > 0) status = "overdue";
    else if (today > closingDate) status = "closed";
    out.push({ cardId: card.id, month, total, paid, open, dueDate, closingDate, status, items });
  }
  return out.sort((a, b) => a.month.localeCompare(b.month));
}

/** Limit currently committed: all purchases (including future installments) minus all invoice payments. */
export function cardUsedLimit(data: FinanceData, cardId: string): Cents {
  const spent = data.transactions
    .filter((t) => t.card_id === cardId)
    .reduce((s, t) => s + toCents(t.amount), 0);
  const paid = data.invoice_payments
    .filter((p) => p.card_id === cardId)
    .reduce((s, p) => s + toCents(p.amount), 0);
  return Math.max(0, spent - paid);
}

/** Card debt on a date: purchases up to the date minus payments up to the date. */
export function cardDebt(data: FinanceData, asOf: string): Cents {
  let debt = 0;
  for (const t of data.transactions) if (t.card_id && t.occurred_on <= asOf) debt += toCents(t.amount);
  for (const p of data.invoice_payments) if (p.paid_on <= asOf) debt -= toCents(p.amount);
  return Math.max(0, debt);
}

/** Split a total in cents into N installments; remainder goes to the first. Mirrors the DB function. */
export function splitInstallments(total: Cents, n: number): Cents[] {
  const base = Math.floor(total / n);
  const rem = total - base * n;
  return Array.from({ length: n }, (_, i) => (i === 0 ? base + rem : base));
}

// ---------- Investments ----------

export interface Position {
  investment: Investment;
  quantity: number;
  avgPrice: number; // BRL per unit
  invested: Cents; // cost basis of the current position
  currentValue: Cents;
  profit: Cents;
  profitRatio: number | null;
}

export function positions(data: FinanceData, asOf?: string): Position[] {
  return data.investments.map((inv) => {
    let qty = 0;
    let cost = 0; // cents
    const moves = data.investment_movements
      .filter((m) => m.investment_id === inv.id && (!asOf || m.moved_on <= asOf))
      .sort((a, b) => a.moved_on.localeCompare(b.moved_on) || a.created_at.localeCompare(b.created_at));
    for (const m of moves) {
      const q = Number(m.quantity);
      if (m.kind === "buy") {
        cost += Math.round(q * Number(m.unit_price) * 100) + toCents(m.fees);
        qty += q;
      } else if (qty > 0) {
        const sold = Math.min(q, qty);
        cost -= Math.round((cost * sold) / qty);
        qty -= sold;
      }
    }
    if (qty < 1e-9) {
      qty = 0;
      cost = 0;
    }
    const currentValue = Math.round(qty * Number(inv.current_price) * 100);
    const profit = currentValue - cost;
    return {
      investment: inv,
      quantity: qty,
      avgPrice: qty > 0 ? cost / 100 / qty : 0,
      invested: cost,
      currentValue,
      profit,
      profitRatio: cost > 0 ? profit / cost : null,
    };
  });
}

// ---------- Net worth ----------

export function netWorth(data: FinanceData, asOf: string, today: string): Cents {
  const cash = totalCash(data, asOf);
  const pos = positions(data, asOf);
  const inv = pos.reduce((s, p) => s + (asOf >= today ? p.currentValue : p.invested), 0);
  return cash + inv - cardDebt(data, asOf);
}

export function netWorthSeries(data: FinanceData, from: string, to: string, today: string) {
  return monthRange(from, to).map((key) => {
    const end = endOfMonth(`${key}-01`);
    const asOf = end > today ? today : end;
    return { month: key, value: netWorth(data, asOf, today) };
  });
}

// ---------- Cash flow ----------

export interface CashFlowRow extends PeriodTotals {
  month: string;
  net: Cents;
  projectedBalance: Cents;
}

export function cashFlow(data: FinanceData, from: string, to: string, today: string): CashFlowRow[] {
  let running = totalCash(data, today);
  const currentMonth = monthKey(today);
  return monthRange(from, to).map((key) => {
    const t = periodTotals(data, `${key}-01`, endOfMonth(`${key}-01`), today);
    const net = t.income + t.plannedIncome - t.expense - t.plannedExpense;
    if (key >= currentMonth) running += t.plannedIncome - t.plannedExpense;
    return { month: key, ...t, net, projectedBalance: key >= currentMonth ? running : totalCash(data, endOfMonth(`${key}-01`)) };
  });
}

// ---------- Students ----------

export function studentClassBalance(data: FinanceData, studentId: string) {
  const credited = data.student_payments
    .filter((p) => p.student_id === studentId)
    .reduce((s, p) => s + p.classes_credited, 0);
  const used = data.class_checkins.filter((c) => c.student_id === studentId).length;
  return { credited, used, remaining: credited - used };
}

// ---------- Grouping helpers ----------

export function sumBy<T>(items: T[], key: (t: T) => string | null, value: (t: T) => Cents) {
  const map = new Map<string, Cents>();
  for (const it of items) {
    const k = key(it) ?? "—";
    map.set(k, (map.get(k) ?? 0) + value(it));
  }
  return map;
}
