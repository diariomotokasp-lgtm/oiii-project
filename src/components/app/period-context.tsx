import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { addMonths, endOfMonth, startOfMonth, todayISO } from "@/lib/finance/dates";

export type PeriodPreset = "month" | "last_month" | "3m" | "6m" | "12m" | "year" | "custom";

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  month: "Este mês",
  last_month: "Mês anterior",
  "3m": "Últimos 3 meses",
  "6m": "Últimos 6 meses",
  "12m": "Últimos 12 meses",
  year: "Ano atual",
  custom: "Personalizado",
};

export interface Period {
  preset: PeriodPreset;
  from: string;
  to: string;
  /** Same-length window immediately before, for comparisons. */
  prevFrom: string;
  prevTo: string;
}

export function computePeriod(preset: PeriodPreset, today: string, custom?: { from: string; to: string }): Period {
  const som = startOfMonth(today);
  let from = som;
  let to = endOfMonth(today);
  let months = 1;
  switch (preset) {
    case "last_month":
      from = addMonths(som, -1);
      to = endOfMonth(from);
      break;
    case "3m":
    case "6m":
    case "12m":
      months = Number(preset.replace("m", ""));
      from = addMonths(som, -(months - 1));
      break;
    case "year":
      from = `${today.slice(0, 4)}-01-01`;
      to = `${today.slice(0, 4)}-12-31`;
      months = 12;
      break;
    case "custom":
      if (custom) {
        from = custom.from;
        to = custom.to;
      }
      break;
  }
  if (preset === "custom") {
    const span = Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1);
    const prevTo = new Date(Date.parse(from) - 86400000).toISOString().slice(0, 10);
    const prevFrom = new Date(Date.parse(prevTo) - (span - 1) * 86400000).toISOString().slice(0, 10);
    return { preset, from, to, prevFrom, prevTo };
  }
  const prevFrom = addMonths(startOfMonth(from), -months);
  const prevTo = endOfMonth(addMonths(startOfMonth(from), -1));
  return { preset, from, to, prevFrom, prevTo };
}

interface Ctx {
  period: Period;
  setPreset: (p: PeriodPreset) => void;
  setCustom: (from: string, to: string) => void;
}

const PeriodContext = createContext<Ctx | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<PeriodPreset>("month");
  const [custom, setCustomState] = useState<{ from: string; to: string } | undefined>();
  const value = useMemo<Ctx>(() => {
    const today = todayISO();
    return {
      period: computePeriod(preset, today, custom),
      setPreset: setPresetState,
      setCustom: (from, to) => {
        setCustomState({ from, to });
        setPresetState("custom");
      },
    };
  }, [preset, custom]);
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used inside PeriodProvider");
  return ctx;
}
