import { useState } from "react";
import { CalendarRange } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PERIOD_LABELS, usePeriod, type PeriodPreset } from "@/components/app/period-context";
import { formatDateBR } from "@/lib/finance/dates";
import { cn } from "@/lib/utils";

const PRESETS: PeriodPreset[] = ["month", "last_month", "3m", "6m", "12m", "year"];

export function PeriodPicker() {
  const { period, setPreset, setCustom } = usePeriod();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const label =
    period.preset === "custom"
      ? `${formatDateBR(period.from)} – ${formatDateBR(period.to)}`
      : PERIOD_LABELS[period.preset];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarRange className="text-primary" />
          <span className="hidden max-w-40 truncate sm:inline">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPreset(p);
                setOpen(false);
              }}
              className={cn(
                "rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                period.preset === p
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Período personalizado</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px]">De</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Até</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <Button
            size="sm"
            className="mt-2 w-full"
            disabled={!from || !to || from > to}
            onClick={() => {
              setCustom(from, to);
              setOpen(false);
            }}
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
