import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { addMonths, todayISO } from "@/lib/finance/dates";
import {
  cardPurchaseSchema,
  deletableTables,
  dividendSchema,
  EDITABLE_TABLES,
  recordSchemas,
  repeatTransactionSchema,
  settleBillSchema,
  studentPaymentSchema,
  type DeletableTable,
  type EditableTable,
} from "@/lib/finance/schemas";
import { FINANCE_TABLES, type FinanceData } from "@/lib/finance/types";

// All data access happens here, on the server, with the service-role client.
// Tables have RLS enabled with no policies, so the browser can never read them directly.
// The whole site (pages + these functions) sits behind the access gate in src/start.ts.

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function friendlyError(err: { code?: string; message?: string } | null): never {
  console.error("[finance]", err);
  if (err?.code === "23503") throw new Error("Este registro está ligado a outros lançamentos e não pode ser removido.");
  if (err?.code === "23514") throw new Error("Algum valor informado não é válido.");
  if (err?.code === "P0001" && err.message) throw new Error(err.message);
  throw new Error("Não foi possível salvar. Tente novamente.");
}

export const getFinanceData = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const result = {} as FinanceData;
  await Promise.all(
    FINANCE_TABLES.map(async (table) => {
      const rows: unknown[] = [];
      const page = 1000;
      for (let from = 0; ; from += page) {
        const { data, error } = await db
          .from(table)
          .select("*")
          .order("created_at", { ascending: true })
          .range(from, from + page - 1);
        if (error) friendlyError(error);
        rows.push(...(data ?? []));
        if (!data || data.length < page) break;
      }
      (result as unknown as Record<string, unknown[]>)[table] = rows;
    }),
  );
  return result;
});

const saveInput = z.object({
  table: z.enum(EDITABLE_TABLES as [EditableTable, ...EditableTable[]]),
  id: z.string().uuid().optional(),
  values: z.record(z.unknown()),
});

export const saveRecord = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data }) => {
    const schema = recordSchemas[data.table];
    const values = schema.parse(data.values) as Record<string, unknown>;
    const db = await admin();

    if (data.table === "transactions" && data.id) {
      const { data: existing } = await db
        .from("transactions")
        .select("card_id, student_payment_id, dividend_id")
        .eq("id", data.id)
        .maybeSingle();
      if (existing?.card_id || existing?.student_payment_id || existing?.dividend_id) {
        throw new Error("Este lançamento é gerenciado pelo módulo de origem (cartão, aluno ou dividendo).");
      }
    }

    const query = data.id
      ? db.from(data.table).update(values as never).eq("id", data.id).select("id").single()
      : db.from(data.table).insert(values as never).select("id").single();
    const { data: row, error } = await query;
    if (error) friendlyError(error);
    return { id: (row as { id: string }).id };
  });

export const createRepeatedTransactions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => repeatTransactionSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const group = data.repeatMonths > 1 ? crypto.randomUUID() : null;
    const today = todayISO();
    const rows = Array.from({ length: data.repeatMonths }, (_, i) => {
      const date = addMonths(data.values.occurred_on, i);
      return {
        ...data.values,
        occurred_on: date,
        status: i === 0 ? data.values.status : date <= today ? data.values.status : "planned",
        recurrence_group: group,
      };
    });
    const { error } = await db.from("transactions").insert(rows as never);
    if (error) friendlyError(error);
    return { count: rows.length };
  });

const deleteInput = z.object({
  table: z.enum(deletableTables as unknown as [DeletableTable, ...DeletableTable[]]),
  id: z.string().uuid(),
});

export const deleteRecord = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteInput.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    if (data.table === "transactions") {
      const { data: existing } = await db
        .from("transactions")
        .select("student_payment_id, dividend_id")
        .eq("id", data.id)
        .maybeSingle();
      if (existing?.student_payment_id || existing?.dividend_id) {
        throw new Error("Remova pelo módulo de origem (pagamento de aluno ou dividendo).");
      }
    }
    const { error } = await db.from(data.table as "tasks").delete().eq("id", data.id);
    if (error) friendlyError(error);
    return { ok: true };
  });

export const deleteInstallmentGroup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ group: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("transactions").delete().eq("installment_group", data.group);
    if (error) friendlyError(error);
    return { ok: true };
  });

export const createCardPurchase = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => cardPurchaseSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.rpc("create_card_purchase", {
      p_card_id: data.card_id,
      p_description: data.description,
      p_total: data.total,
      p_date: data.date,
      p_installments: data.installments,
      p_category_id: data.category_id ?? undefined,
      p_notes: data.notes ?? undefined,
    } as never);
    if (error) friendlyError(error);
    return { ok: true };
  });

export const registerStudentPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => studentPaymentSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.rpc("register_student_payment", {
      p_student_id: data.student_id,
      p_amount: data.amount,
      p_date: data.date,
      p_classes: data.classes,
      p_account_id: data.account_id,
      p_notes: data.notes ?? undefined,
    } as never);
    if (error) friendlyError(error);
    return { ok: true };
  });

export const registerDividend = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => dividendSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.rpc("register_dividend", {
      p_investment_id: data.investment_id,
      p_kind: data.kind,
      p_amount: data.amount,
      p_date: data.date,
      p_account_id: data.account_id,
      p_income_source_id: data.income_source_id ?? undefined,
      p_notes: data.notes ?? undefined,
    } as never);
    if (error) friendlyError(error);
    return { ok: true };
  });

export const settleBill = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => settleBillSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.rpc("settle_bill", {
      p_bill_id: data.bill_id,
      p_date: data.date,
      p_account_id: data.account_id,
    });
    if (error) friendlyError(error);
    return { ok: true };
  });
