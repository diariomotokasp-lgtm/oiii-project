import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFinance, useToday } from "@/hooks/use-finance";
import { cardInvoices } from "@/lib/finance/calc";
import { addDays, diffDays, formatDateBR } from "@/lib/finance/dates";
import { formatBRL, toCents } from "@/lib/finance/money";
import { cn } from "@/lib/utils";

export interface Alert {
  id: string;
  title: string;
  detail: string;
  date: string;
  to: string;
  overdue: boolean;
}

export function useAlerts(windowDays = 7): Alert[] {
  const data = useFinance();
  const today = useToday();
  return useMemo(() => {
    const limit = addDays(today, windowDays);
    const out: Alert[] = [];
    for (const b of data.bills) {
      if (b.status !== "pending" || b.due_date > limit) continue;
      out.push({
        id: `bill-${b.id}`,
        title: b.description,
        detail: `${b.kind === "payable" ? "A pagar" : "A receber"} · ${formatBRL(toCents(b.amount))}`,
        date: b.due_date,
        to: b.kind === "payable" ? "/contas-a-pagar" : "/contas-a-receber",
        overdue: b.due_date < today,
      });
    }
    for (const card of data.credit_cards) {
      for (const inv of cardInvoices(data, card, today)) {
        if (inv.open <= 0 || inv.dueDate > limit) continue;
        out.push({
          id: `inv-${card.id}-${inv.month}`,
          title: `Fatura ${card.name}`,
          detail: formatBRL(inv.open),
          date: inv.dueDate,
          to: "/faturas",
          overdue: inv.dueDate < today,
        });
      }
    }
    for (const r of data.reminders) {
      if (r.done || r.remind_on > limit) continue;
      out.push({
        id: `rem-${r.id}`,
        title: r.title,
        detail: "Lembrete",
        date: r.remind_on,
        to: "/lembretes",
        overdue: r.remind_on < today,
      });
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [data, today, windowDays]);
}

export function NotificationsButton() {
  const alerts = useAlerts();
  const today = useToday();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell />
          {alerts.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {alerts.length > 9 ? "9+" : alerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Próximos 7 dias</div>
        <div className="max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhum vencimento próximo.</p>
          ) : (
            alerts.map((a) => {
              const d = diffDays(today, a.date);
              return (
                <Link
                  key={a.id}
                  to={a.to}
                  className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-0 hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                  </div>
                  <div className={cn("shrink-0 text-right text-xs", a.overdue ? "text-negative" : "text-muted-foreground")}>
                    {formatDateBR(a.date)}
                    <div>{a.overdue ? "Vencido" : d === 0 ? "Hoje" : `em ${d} dia${d > 1 ? "s" : ""}`}</div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
