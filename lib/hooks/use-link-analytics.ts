"use client";

import { useQuery } from "@tanstack/react-query";

export function useLinkClickCounts() {
  return useQuery({
    queryKey: ["link-click-counts"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/links");
      if (!res.ok) {
        throw new Error("Failed to fetch link click counts");
      }
      const data = await res.json();
      return (data.counts || {}) as Record<string, number>;
    },
    refetchInterval: 30000,
  });
}

export function useLinkAnalytics(linkId: string | null) {
  return useQuery({
    queryKey: ["link-analytics", linkId],
    queryFn: async () => {
      if (!linkId) return null;
      const res = await fetch(`/api/analytics?linkId=${linkId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch link analytics");
      }
      return res.json();
    },
    enabled: !!linkId,
  });
}

