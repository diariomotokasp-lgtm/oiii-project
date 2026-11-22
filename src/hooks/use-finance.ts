import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { getFinanceData } from "@/lib/finance.functions";
import { todayISO } from "@/lib/finance/dates";

export const financeQuery = queryOptions({
  queryKey: ["finance"],
  queryFn: () => getFinanceData(),
  staleTime: 15_000,
});

export function useFinance() {
  return useSuspenseQuery(financeQuery).data;
}

export function useToday() {
  return todayISO();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyServerFn = (opts: { data: any }) => Promise<any>;

/** Wraps a server function call: toasts, and refreshes all finance data on success. */
export function useFinanceAction<F extends AnyServerFn>(fn: F, successMessage?: string) {
  const call = useServerFn(fn) as unknown as AnyServerFn;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<F>[0]["data"]) => call({ data }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: financeQuery.queryKey });
      if (successMessage) toast.success(successMessage);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Algo deu errado.");
    },
  });
}
