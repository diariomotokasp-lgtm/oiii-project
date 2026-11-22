// Money is handled as integer cents to avoid floating point drift.
export type Cents = number;

export function toCents(value: number | string | null | undefined): Cents {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function fromCents(cents: Cents): number {
  return Math.round(cents) / 100;
}

/** Parses Brazilian input like "1.234,56", "1234,5" or "1234.56" into cents. */
export function parseBRL(input: string): Cents | null {
  const s = input.trim().replace(/[R$\s]/g, "");
  if (!s) return null;
  let normalized = s;
  if (s.includes(",")) normalized = s.replace(/\./g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{0,2})?$/.test(normalized)) return null;
  return toCents(normalized);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatBRL(cents: Cents): string {
  return brl.format(fromCents(cents));
}

export function formatBRLCompact(cents: Cents): string {
  return brlCompact.format(fromCents(cents));
}

export function formatPercent(ratio: number, digits = 1): string {
  if (!Number.isFinite(ratio)) return "—";
  return `${ratio >= 0 ? "+" : ""}${(ratio * 100).toFixed(digits).replace(".", ",")}%`;
}

/** Percent change from previous to current; null when previous is zero. */
export function changeRatio(current: Cents, previous: Cents): number | null {
  if (previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

export function sumCents(values: Cents[]): Cents {
  return values.reduce((a, b) => a + b, 0);
}
