
-- ============ CORE TABLES ============
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  institution text,
  account_type text NOT NULL DEFAULT 'corrente' CHECK (account_type IN ('corrente','poupanca','carteira','investimento','outro')),
  initial_balance numeric(14,2) NOT NULL DEFAULT 0,
  color text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.income_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.credit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  limit_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (limit_amount >= 0),
  closing_day int NOT NULL DEFAULT 1 CHECK (closing_day BETWEEN 1 AND 31),
  due_day int NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 31),
  payment_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  billing_type text NOT NULL DEFAULT 'package' CHECK (billing_type IN ('monthly','package','per_class')),
  price numeric(14,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  classes_per_package int NOT NULL DEFAULT 0 CHECK (classes_per_package >= 0),
  income_source_id uuid REFERENCES public.income_sources(id) ON DELETE SET NULL,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  paid_on date NOT NULL,
  classes_credited int NOT NULL DEFAULT 0 CHECK (classes_credited >= 0),
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.class_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ticker text,
  asset_type text NOT NULL DEFAULT 'acao' CHECK (asset_type IN ('acao','fii','renda_fixa','outro')),
  current_price numeric(18,6) NOT NULL DEFAULT 0 CHECK (current_price >= 0),
  price_updated_at timestamptz,
  price_source text NOT NULL DEFAULT 'manual',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.investment_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('buy','sell')),
  quantity numeric(18,6) NOT NULL CHECK (quantity > 0),
  unit_price numeric(18,6) NOT NULL CHECK (unit_price >= 0),
  fees numeric(14,2) NOT NULL DEFAULT 0 CHECK (fees >= 0),
  moved_on date NOT NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.dividends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE RESTRICT,
  kind text NOT NULL DEFAULT 'dividendo' CHECK (kind IN ('dividendo','jcp','rendimento')),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  received_on date NOT NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('payable','receivable')),
  description text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','settled')),
  settled_on date,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  income_source_id uuid REFERENCES public.income_sources(id) ON DELETE SET NULL,
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none','weekly','monthly','yearly')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  description text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  occurred_on date NOT NULL,
  status text NOT NULL DEFAULT 'realized' CHECK (status IN ('realized','planned')),
  account_id uuid REFERENCES public.accounts(id) ON DELETE RESTRICT,
  card_id uuid REFERENCES public.credit_cards(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  income_source_id uuid REFERENCES public.income_sources(id) ON DELETE SET NULL,
  installment_group uuid,
  installment_number int,
  installment_total int,
  recurrence_group uuid,
  student_payment_id uuid REFERENCES public.student_payments(id) ON DELETE CASCADE,
  dividend_id uuid REFERENCES public.dividends(id) ON DELETE CASCADE,
  bill_id uuid REFERENCES public.bills(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT card_only_expense CHECK (card_id IS NULL OR kind = 'expense'),
  CONSTRAINT card_or_account CHECK (NOT (card_id IS NOT NULL AND account_id IS NOT NULL))
);
CREATE INDEX transactions_occurred_on_idx ON public.transactions(occurred_on);
CREATE INDEX transactions_card_idx ON public.transactions(card_id);
CREATE INDEX transactions_installment_idx ON public.transactions(installment_group);

CREATE TABLE public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  to_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  transferred_on date NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_accounts CHECK (from_account_id <> to_account_id)
);

CREATE TABLE public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.credit_cards(id) ON DELETE RESTRICT,
  reference_month date NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  paid_on date NOT NULL,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_amount numeric(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  remind_on date NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  done boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  due_on date,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  done boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_log (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- ============ GRANTS + RLS (server-only access) ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['accounts','categories','income_sources','credit_cards','students','student_payments','class_checkins','investments','investment_movements','dividends','bills','transactions','transfers','invoice_payments','goals','reminders','tasks','audit_log']
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
GRANT USAGE, SELECT ON SEQUENCE public.audit_log_id_seq TO service_role;

-- ============ updated_at + audit triggers ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log(table_name, record_id, action, old_data) VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log(table_name, record_id, action, old_data, new_data) VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO public.audit_log(table_name, record_id, action, new_data) VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['accounts','categories','income_sources','credit_cards','students','student_payments','class_checkins','investments','investment_movements','dividends','bills','transactions','transfers','invoice_payments','goals','reminders','tasks']
  LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t || '_touch', t);
    EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_changes()', t || '_audit', t);
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.audit_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- ============ ATOMIC OPERATIONS ============

-- Card purchase split into installments (cents-exact; remainder on the 1st installment)
CREATE OR REPLACE FUNCTION public.create_card_purchase(
  p_card_id uuid, p_description text, p_total numeric, p_date date, p_installments int,
  p_category_id uuid, p_notes text
) RETURNS uuid LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_group uuid := gen_random_uuid();
  v_total_cents bigint := round(p_total * 100);
  v_base bigint;
  v_rem bigint;
  i int;
  v_amt numeric(14,2);
BEGIN
  IF p_installments < 1 OR p_installments > 72 THEN RAISE EXCEPTION 'Número de parcelas inválido'; END IF;
  IF v_total_cents <= 0 THEN RAISE EXCEPTION 'Valor deve ser positivo'; END IF;
  IF v_total_cents < p_installments THEN RAISE EXCEPTION 'Valor menor que o número de parcelas'; END IF;
  v_base := v_total_cents / p_installments;
  v_rem := v_total_cents - v_base * p_installments;
  FOR i IN 1..p_installments LOOP
    v_amt := (CASE WHEN i = 1 THEN v_base + v_rem ELSE v_base END)::numeric / 100;
    INSERT INTO public.transactions(kind, description, amount, occurred_on, status, card_id, category_id,
      installment_group, installment_number, installment_total, notes)
    VALUES ('expense',
      CASE WHEN p_installments > 1 THEN p_description || ' (' || i || '/' || p_installments || ')' ELSE p_description END,
      v_amt, (p_date + make_interval(months => i - 1))::date, 'realized', p_card_id, p_category_id,
      CASE WHEN p_installments > 1 THEN v_group ELSE NULL END,
      CASE WHEN p_installments > 1 THEN i ELSE NULL END,
      CASE WHEN p_installments > 1 THEN p_installments ELSE NULL END,
      p_notes);
  END LOOP;
  RETURN v_group;
END $$;

-- Student payment: one income transaction; check-ins never create income
CREATE OR REPLACE FUNCTION public.register_student_payment(
  p_student_id uuid, p_amount numeric, p_date date, p_classes int, p_account_id uuid, p_notes text
) RETURNS uuid LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_id uuid; v_student public.students;
BEGIN
  SELECT * INTO v_student FROM public.students WHERE id = p_student_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Aluno não encontrado'; END IF;
  INSERT INTO public.student_payments(student_id, amount, paid_on, classes_credited, account_id, notes)
  VALUES (p_student_id, p_amount, p_date, COALESCE(p_classes,0), p_account_id, p_notes) RETURNING id INTO v_id;
  INSERT INTO public.transactions(kind, description, amount, occurred_on, status, account_id, income_source_id, student_payment_id)
  VALUES ('income', 'Aluno: ' || v_student.name, p_amount, p_date, 'realized', p_account_id, v_student.income_source_id, v_id);
  RETURN v_id;
END $$;

-- Dividend: counted as income when received
CREATE OR REPLACE FUNCTION public.register_dividend(
  p_investment_id uuid, p_kind text, p_amount numeric, p_date date, p_account_id uuid, p_income_source_id uuid, p_notes text
) RETURNS uuid LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_id uuid; v_inv public.investments;
BEGIN
  SELECT * INTO v_inv FROM public.investments WHERE id = p_investment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ativo não encontrado'; END IF;
  INSERT INTO public.dividends(investment_id, kind, amount, received_on, account_id, notes)
  VALUES (p_investment_id, p_kind, p_amount, p_date, p_account_id, p_notes) RETURNING id INTO v_id;
  INSERT INTO public.transactions(kind, description, amount, occurred_on, status, account_id, income_source_id, dividend_id)
  VALUES ('income', initcap(p_kind) || ': ' || COALESCE(v_inv.ticker, v_inv.name), p_amount, p_date, 'realized', p_account_id, p_income_source_id, v_id);
  RETURN v_id;
END $$;

-- Settle a bill (payable/receivable): creates realized transaction, schedules next occurrence
CREATE OR REPLACE FUNCTION public.settle_bill(p_bill_id uuid, p_date date, p_account_id uuid)
RETURNS uuid LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_bill public.bills; v_tx uuid; v_next date;
BEGIN
  SELECT * INTO v_bill FROM public.bills WHERE id = p_bill_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conta não encontrada'; END IF;
  IF v_bill.status = 'settled' THEN RAISE EXCEPTION 'Esta conta já foi liquidada'; END IF;
  INSERT INTO public.transactions(kind, description, amount, occurred_on, status, account_id, category_id, income_source_id, bill_id)
  VALUES (CASE WHEN v_bill.kind = 'payable' THEN 'expense' ELSE 'income' END, v_bill.description, v_bill.amount, p_date,
    'realized', p_account_id, v_bill.category_id, v_bill.income_source_id, v_bill.id) RETURNING id INTO v_tx;
  UPDATE public.bills SET status = 'settled', settled_on = p_date, account_id = p_account_id WHERE id = p_bill_id;
  IF v_bill.recurrence <> 'none' THEN
    v_next := CASE v_bill.recurrence
      WHEN 'weekly' THEN v_bill.due_date + 7
      WHEN 'monthly' THEN (v_bill.due_date + interval '1 month')::date
      ELSE (v_bill.due_date + interval '1 year')::date END;
    INSERT INTO public.bills(kind, description, amount, due_date, account_id, category_id, income_source_id, recurrence, notes)
    VALUES (v_bill.kind, v_bill.description, v_bill.amount, v_next, v_bill.account_id, v_bill.category_id, v_bill.income_source_id, v_bill.recurrence, v_bill.notes);
  END IF;
  RETURN v_tx;
END $$;

REVOKE EXECUTE ON FUNCTION public.create_card_purchase(uuid, text, numeric, date, int, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_student_payment(uuid, numeric, date, int, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_dividend(uuid, text, numeric, date, uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.settle_bill(uuid, date, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_card_purchase(uuid, text, numeric, date, int, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.register_student_payment(uuid, numeric, date, int, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.register_dividend(uuid, text, numeric, date, uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_bill(uuid, date, uuid) TO service_role;

-- ============ CONFIGURATION SEED (sources + categories, no fake financial data) ============
INSERT INTO public.income_sources(name) VALUES
  ('Personal'),('Eletroestimulação'),('iFood'),('99'),('Keeta'),('Dividendos de FIIs'),('Dividendos de ações');

INSERT INTO public.categories(name, kind) VALUES
  ('Serviços prestados','income'),('Vendas','income'),('Rendimentos','income'),('Outras receitas','income'),
  ('Alimentação','expense'),('Moradia','expense'),('Transporte','expense'),('Combustível','expense'),
  ('Saúde','expense'),('Educação','expense'),('Lazer','expense'),('Assinaturas','expense'),
  ('Manutenção do veículo','expense'),('Impostos e taxas','expense'),('Outras despesas','expense');
