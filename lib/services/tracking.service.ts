import { db } from "../db";
import { createHash } from "crypto";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_CLICKS = 10;
const DUPLICATE_WINDOW_MS = 5 * 1000;

const BOT_USER_AGENTS = [
  "bot", "crawler", "spider", "scraper", "curl", "wget", "python", "java",
  "go-http", "httpie", "postman", "insomnia", "headless", "phantom", "selenium",
  "webdriver", "puppeteer", "playwright", "googlebot", "bingbot", "slurp",
  "duckduckbot", "baiduspider", "yandexbot", "sogou", "exabot", "facebot",
  "ia_archiver", "archive.org_bot", "msnbot", "ahrefs", "semrush", "mj12bot",
];

function generateSessionFingerprint(
  ipAddress: string | null,
  userAgent: string | null,
  headers: Record<string, string | null>
): string {
  const components = [
    ipAddress || "unknown",
    userAgent || "unknown",
    headers["accept-language"] || "",
    headers["accept-encoding"] || "",
  ].join("|");

  return createHash("sha256").update(components).digest("hex").substring(0, 16);
}

function generateIdempotencyKey(
  linkId: string,
  sessionFingerprint: string,
  timestamp: number
): string {
  const key = `${linkId}:${sessionFingerprint}:${Math.floor(timestamp / 1000)}`;
  return createHash("sha256").update(key).digest("hex").substring(0, 32);
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function detectDevice(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return "mobile";
  }
  if (/Tablet|iPad|PlayBook|Silk/i.test(userAgent)) {
    return "tablet";
  }
  return "desktop";
}

function detectBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "chrome";
  if (ua.includes("firefox/")) return "firefox";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "safari";
  if (ua.includes("opera/") || ua.includes("opr/")) return "opera";
  if (ua.includes("msie") || ua.includes("trident/")) return "ie";
  return "other";
}

export interface TrackingData {
  linkId: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  country: string | null;
  headers: Record<string, string | null>;
}

export interface TrackingResult {
  success: boolean;
  tracked: boolean;
  reason?: string;
  idempotencyKey?: string;
}

export const trackingService = {
  async trackClick(data: TrackingData): Promise<TrackingResult> {
    const { linkId, ipAddress, userAgent, referrer, country, headers } = data;

    const sessionFingerprint = generateSessionFingerprint(ipAddress, userAgent, headers);
    const now = Date.now();
    const idempotencyKey = generateIdempotencyKey(linkId, sessionFingerprint, now);

    try {
      const existingClick = await db.linkClick.findUnique({
        where: { idempotencyKey },
      });

      if (existingClick) {
        return {
          success: true,
          tracked: false,
          reason: "duplicate",
          idempotencyKey,
        };
      }

      const recentDuplicate = await db.linkClick.findFirst({
        where: {
          linkId,
          sessionFingerprint,
          clickedAt: {
            gte: new Date(now - DUPLICATE_WINDOW_MS),
          },
        },
        orderBy: { clickedAt: "desc" },
      });

      if (recentDuplicate) {
        return {
          success: true,
          tracked: false,
          reason: "rate_limited_duplicate",
          idempotencyKey,
        };
      }

      const recentClicks = await db.linkClick.count({
        where: {
          linkId,
          sessionFingerprint,
          clickedAt: {
            gte: new Date(now - RATE_LIMIT_WINDOW_MS),
          },
        },
      });

      if (recentClicks >= RATE_LIMIT_MAX_CLICKS) {
        return {
          success: true,
          tracked: false,
          reason: "rate_limited",
          idempotencyKey,
        };
      }

      const botDetected = isBot(userAgent);
      const device = detectDevice(userAgent);
      const browser = detectBrowser(userAgent);

      await db.linkClick.create({
        data: {
          linkId,
          referrer: referrer || undefined,
          country: country || undefined,
          device: device || undefined,
          browser: browser || undefined,
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          sessionFingerprint,
          idempotencyKey,
          isBot: botDetected,
        },
      });

      return {
        success: true,
        tracked: true,
        idempotencyKey,
      };
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const prismaError = error as { code: string };
        if (prismaError.code === "P2002") {
          return {
            success: true,
            tracked: false,
            reason: "duplicate",
            idempotencyKey,
          };
        }
      }

      console.error("Tracking error:", error);
      return {
        success: false,
        tracked: false,
        reason: "database_error",
        idempotencyKey,
      };
    }
  },

  async trackClickWithRetry(
    data: TrackingData,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<TrackingResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      }

      try {
        const result = await this.trackClick(data);
        if (result.success) {
          return result;
        }
        if (result.reason !== "database_error") {
          return result;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt === maxRetries - 1) {
          break;
        }
      }
    }

    return {
      success: false,
      tracked: false,
      reason: "max_retries_exceeded",
    };
  },
};

