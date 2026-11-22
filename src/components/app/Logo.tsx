import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="jg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--gold-soft)" />
          <stop offset="55%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--gold-deep)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--card-2)" stroke="url(#jg-gold)" strokeOpacity="0.55" />
      <rect x="9" y="22" width="5" height="9" rx="1.5" fill="url(#jg-gold)" opacity="0.55" />
      <rect x="17.5" y="17" width="5" height="14" rx="1.5" fill="url(#jg-gold)" opacity="0.8" />
      <rect x="26" y="11" width="5" height="20" rx="1.5" fill="url(#jg-gold)" />
      <path d="M8 18.5 L17 12.5 L22 15 L31 8" fill="none" stroke="var(--gold-soft)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31" cy="8" r="1.9" fill="var(--gold-soft)" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-foreground">Jonathan Goiana</div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-gradient-gold">
            Finance Center
          </div>
        </div>
      )}
    </div>
  );
}
