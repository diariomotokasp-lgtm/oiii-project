import type { Tables } from "@/integrations/supabase/types";

export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;
export type IncomeSource = Tables<"income_sources">;
export type CreditCard = Tables<"credit_cards">;
export type Student = Tables<"students">;
export type StudentPayment = Tables<"student_payments">;
export type ClassCheckin = Tables<"class_checkins">;
export type Investment = Tables<"investments">;
export type InvestmentMovement = Tables<"investment_movements">;
export type Dividend = Tables<"dividends">;
export type Bill = Tables<"bills">;
export type Transaction = Tables<"transactions">;
export type Transfer = Tables<"transfers">;
export type InvoicePayment = Tables<"invoice_payments">;
export type Goal = Tables<"goals">;
export type Reminder = Tables<"reminders">;
export type Task = Tables<"tasks">;

export interface FinanceData {
  accounts: Account[];
  categories: Category[];
  income_sources: IncomeSource[];
  credit_cards: CreditCard[];
  students: Student[];
  student_payments: StudentPayment[];
  class_checkins: ClassCheckin[];
  investments: Investment[];
  investment_movements: InvestmentMovement[];
  dividends: Dividend[];
  bills: Bill[];
  transactions: Transaction[];
  transfers: Transfer[];
  invoice_payments: InvoicePayment[];
  goals: Goal[];
  reminders: Reminder[];
  tasks: Task[];
}

export const FINANCE_TABLES = [
  "accounts",
  "categories",
  "income_sources",
  "credit_cards",
  "students",
  "student_payments",
  "class_checkins",
  "investments",
  "investment_movements",
  "dividends",
  "bills",
  "transactions",
  "transfers",
  "invoice_payments",
  "goals",
  "reminders",
  "tasks",
] as const satisfies readonly (keyof FinanceData)[];

export type FinanceTable = (typeof FINANCE_TABLES)[number];

export function emptyFinanceData(): FinanceData {
  return {
    accounts: [], categories: [], income_sources: [], credit_cards: [], students: [],
    student_payments: [], class_checkins: [], investments: [], investment_movements: [],
    dividends: [], bills: [], transactions: [], transfers: [], invoice_payments: [],
    goals: [], reminders: [], tasks: [],
  };
}
