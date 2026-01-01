"use client";

import { cloneElement, isValidElement, useCallback } from "react";

function shouldTrack(): boolean {
  if (typeof navigator === "undefined") return true;
  
  if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") {
    return false;
  }

  if (typeof window !== "undefined" && (window as any).doNotTrack === "1") {
    return false;
  }

  return true;
}

async function trackClickWithRetry(
  linkId: string,
  maxRetries = 3,
  retryDelay = 1000
): Promise<void> {
  if (!shouldTrack()) {
    return;
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success || !data.retry) {
          return;
        }
      }

      if (response.status === 503 && attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      if (response.status >= 400 && response.status < 500) {
        return;
      }

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.warn("Failed to track click after retries:", error);
      }
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }
}

export default function LinkClickTracker({
  children,
  linkId,
}: {
  children: React.ReactNode;
  linkId: string;
}) {
  const handleClick = useCallback(() => {
    trackClickWithRetry(linkId).catch(() => {});
  }, [linkId]);

  if (isValidElement(children)) {
    return cloneElement(children as any, {
      onClick: (e: React.MouseEvent) => {
        handleClick();
        if ((children as any).props.onClick) {
          (children as any).props.onClick(e);
        }
      },
    });
  }

  return <>{children}</>;
}

