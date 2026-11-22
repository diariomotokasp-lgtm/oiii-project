import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Bell,
  CalendarClock,
  CheckSquare,
  Coins,
  CreditCard,

  GraduationCap,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Layers,
  LineChart,
  Receipt,
  Settings,
  Target,
  Wallet,
  Waves,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contas", label: "Contas bancárias", icon: Landmark },
  { to: "/receitas", label: "Receitas", icon: ArrowUpCircle },
  { to: "/despesas", label: "Despesas", icon: ArrowDownCircle },
  { to: "/fontes-de-renda", label: "Fontes de renda", icon: Wallet },
  { to: "/alunos", label: "Alunos e aulas", icon: GraduationCap },
  { to: "/cartoes", label: "Cartões de crédito", icon: CreditCard },
  { to: "/parcelamentos", label: "Parcelamentos", icon: Layers },
  { to: "/faturas", label: "Faturas", icon: Receipt },
  { to: "/contas-a-pagar", label: "Contas a pagar", icon: CalendarClock },
  { to: "/contas-a-receber", label: "Contas a receber", icon: HandCoins },
  { to: "/investimentos", label: "Investimentos", icon: LineChart },
  { to: "/dividendos", label: "Dividendos", icon: Coins },
  { to: "/metas", label: "Metas financeiras", icon: Target },
  { to: "/fluxo-de-caixa", label: "Fluxo de caixa", icon: Waves },
  { to: "/lembretes", label: "Lembretes", icon: Bell },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export const APP_NAME = "Jonathan Goiana Finance Center";

export function titleForPath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return NAV_ITEMS.find((n) => n.to === clean)?.label ?? APP_NAME;
}

