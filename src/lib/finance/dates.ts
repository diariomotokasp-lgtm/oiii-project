// Dates are stored as "YYYY-MM-DD" strings and interpreted in America/Sao_Paulo.
export const TIMEZONE = "America/Sao_Paulo";

export function todayISO(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts; // en-CA yields YYYY-MM-DD
}

export function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y: y ?? 1970, m: m ?? 1, d: d ?? 1 };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function makeISO(y: number, m: number, d: number): string {
  const day = Math.min(d, daysInMonth(y, m));
  return `${y}-${pad(m)}-${pad(day)}`;
}

/** "YYYY-MM" month key */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function addMonths(iso: string, n: number): string {
  const { y, m, d } = parseISO(iso);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return makeISO(ny, nm, d);
}

export function addDays(iso: string, n: number): string {
  const { y, m, d } = parseISO(iso);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso: string): string {
  const { y, m } = parseISO(iso);
  return makeISO(y, m, 31);
}

export function diffDays(fromISO: string, toISO: string): number {
  const a = parseISO(fromISO);
  const b = parseISO(toISO);
  return Math.round(
    (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000,
  );
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const { y, m, d } = parseISO(iso);
  return `${pad(d)}/${pad(m)}/${y}`;
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_LONG = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function formatMonthShort(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]}/${String(y).slice(2)}`;
}

export function formatMonthLong(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_LONG[(m ?? 1) - 1]} de ${y}`;
}

export function formatLongToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}

/** Inclusive list of month keys between two ISO dates. */
export function monthRange(fromISO: string, toISO: string): string[] {
  const out: string[] = [];
  let cur = startOfMonth(fromISO);
  const end = monthKey(toISO);
  let guard = 0;
  while (monthKey(cur) <= end && guard < 240) {
    out.push(monthKey(cur));
    cur = addMonths(cur, 1);
    guard++;
  }
  return out;
}

export function inRange(iso: string, from: string, to: string): boolean {
  return iso >= from && iso <= to;
}
