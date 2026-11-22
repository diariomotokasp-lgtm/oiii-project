import { z } from "zod";

const money = z.coerce.number().finite().min(0).max(999_999_999_999);
const positiveMoney = z.coerce.number().finite().gt(0).max(999_999_999_999);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");
const optDate = isoDate.nullable().optional();
const uuid = z.string().uuid();
const optUuid = uuid.nullable().optional();
const text = z.string().trim().min(1, "Obrigatório").max(200);
const optText = z.string().trim().max(2000).nullable().optional();
const priority = z.enum(["low", "medium", "high"]);

export const recordSchemas = {
  accounts: z.object({
    name: text,
    institution: optText,
    account_type: z.enum(["corrente", "poupanca", "carteira", "investimento", "outro"]),
    initial_balance: z.coerce.number().finite(),
    color: optText,
    active: z.boolean().optional(),
  }),
  categories: z.object({ name: text, kind: z.enum(["income", "expense"]), color: optText }),
  income_sources: z.object({ name: text, description: optText, active: z.boolean().optional() }),
  credit_cards: z.object({
    name: text,
    brand: optText,
    limit_amount: money,
    closing_day: z.coerce.number().int().min(1).max(31),
    due_day: z.coerce.number().int().min(1).max(31),
    payment_account_id: optUuid,
    active: z.boolean().optional(),
  }),
  students: z.object({
    name: text,
    phone: optText,
    billing_type: z.enum(["monthly", "package", "per_class"]),
    price: money,
    classes_per_package: z.coerce.number().int().min(0).max(1000),
    income_source_id: optUuid,
    notes: optText,
    active: z.boolean().optional(),
  }),
  class_checkins: z.object({ student_id: uuid, class_date: isoDate, notes: optText }),
  investments: z.object({
    name: text,
    ticker: optText,
    asset_type: z.enum(["acao", "fii", "renda_fixa", "outro"]),
    current_price: z.coerce.number().finite().min(0),
    notes: optText,
  }),
  investment_movements: z.object({
    investment_id: uuid,
    kind: z.enum(["buy", "sell"]),
    quantity: z.coerce.number().finite().gt(0),
    unit_price: z.coerce.number().finite().min(0),
    fees: money.optional(),
    moved_on: isoDate,
    account_id: optUuid,
    notes: optText,
  }),
  bills: z.object({
    kind: z.enum(["payable", "receivable"]),
    description: text,
    amount: positiveMoney,
    due_date: isoDate,
    account_id: optUuid,
    category_id: optUuid,
    income_source_id: optUuid,
    recurrence: z.enum(["none", "weekly", "monthly", "yearly"]),
    notes: optText,
  }),
  transactions: z.object({
    kind: z.enum(["income", "expense"]),
    description: text,
    amount: positiveMoney,
    occurred_on: isoDate,
    status: z.enum(["realized", "planned"]),
    account_id: uuid,
    category_id: optUuid,
    income_source_id: optUuid,
    notes: optText,
  }),
  transfers: z
    .object({
      from_account_id: uuid,
      to_account_id: uuid,
      amount: positiveMoney,
      transferred_on: isoDate,
      description: optText,
    })
    .refine((v) => v.from_account_id !== v.to_account_id, "Escolha contas diferentes"),
  invoice_payments: z.object({
    card_id: uuid,
    reference_month: isoDate,
    amount: positiveMoney,
    paid_on: isoDate,
    account_id: uuid,
    notes: optText,
  }),
  goals: z.object({
    name: text,
    target_amount: positiveMoney,
    current_amount: money,
    deadline: optDate,
    notes: optText,
  }),
  reminders: z.object({
    title: text,
    remind_on: isoDate,
    priority,
    done: z.boolean().optional(),
    notes: optText,
  }),
  tasks: z.object({
    title: text,
    due_on: optDate,
    priority,
    done: z.boolean().optional(),
    notes: optText,
  }),
} as const;

export type EditableTable = keyof typeof recordSchemas;
export const EDITABLE_TABLES = Object.keys(recordSchemas) as EditableTable[];

export const deletableTables = [
  ...EDITABLE_TABLES,
  "student_payments",
  "dividends",
] as const;
export type DeletableTable = (typeof deletableTables)[number];

export const cardPurchaseSchema = z.object({
  card_id: uuid,
  description: text,
  total: positiveMoney,
  date: isoDate,
  installments: z.coerce.number().int().min(1).max(72),
  category_id: optUuid,
  notes: optText,
});

export const studentPaymentSchema = z.object({
  student_id: uuid,
  amount: positiveMoney,
  date: isoDate,
  classes: z.coerce.number().int().min(0).max(1000),
  account_id: uuid,
  notes: optText,
});

export const dividendSchema = z.object({
  investment_id: uuid,
  kind: z.enum(["dividendo", "jcp", "rendimento"]),
  amount: positiveMoney,
  date: isoDate,
  account_id: uuid,
  income_source_id: optUuid,
  notes: optText,
});

export const settleBillSchema = z.object({ bill_id: uuid, date: isoDate, account_id: uuid });

export const repeatTransactionSchema = z.object({
  values: recordSchemas.transactions,
  repeatMonths: z.coerce.number().int().min(1).max(60),
});
