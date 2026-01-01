import { db } from "../db";
import { Prisma } from "../generated/prisma/client";

export const analyticsService = {
  async getLinkStats(linkId: string, startDate?: Date, endDate?: Date, includeBots = false) {
    const where: Prisma.LinkClickWhereInput = { 
      linkId,
      ...(includeBots ? {} : { isBot: false }),
    };
    
    if (startDate || endDate) {
      where.clickedAt = {};
      if (startDate) where.clickedAt.gte = startDate;
      if (endDate) where.clickedAt.lte = endDate;
    }

    const [totalClicks, allClicks, clicksByCountry, clicksByDevice, clicksByBrowser] = await Promise.all([
      db.linkClick.count({ where }),
      db.linkClick.findMany({
        where,
        select: { clickedAt: true },
        orderBy: { clickedAt: "asc" },
      }),
      db.linkClick.groupBy({
        by: ["country"],
        where: { ...where, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: "desc" } },
      }),
      db.linkClick.groupBy({
        by: ["device"],
        where: { ...where, device: { not: null } },
        _count: true,
        orderBy: { _count: { device: "desc" } },
      }),
      db.linkClick.groupBy({
        by: ["browser"],
        where: { ...where, browser: { not: null } },
        _count: true,
        orderBy: { _count: { browser: "desc" } },
      }),
    ]);

    const clicksByDate = new Map<string, number>();
    allClicks.forEach((click) => {
      const date = click.clickedAt.toISOString().split("T")[0];
      clicksByDate.set(date, (clicksByDate.get(date) || 0) + 1);
    });

    const clicksOverTimeFormatted = Array.from(clicksByDate.entries())
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const clicksByCountryFormatted = clicksByCountry.map((item) => ({
      country: item.country || "Unknown",
      clicks: item._count,
    }));

    const clicksByDeviceFormatted = clicksByDevice.map((item) => ({
      device: item.device || "Unknown",
      clicks: item._count,
    }));

    const clicksByBrowserFormatted = clicksByBrowser.map((item) => ({
      browser: item.browser || "Unknown",
      clicks: item._count,
    }));

    const referrers = await db.linkClick.findMany({
      where: { ...where, referrer: { not: null } },
      select: { referrer: true },
      distinct: ["referrer"],
    });

    return {
      linkId,
      totalClicks,
      clicksOverTime: clicksOverTimeFormatted,
      clicksByCountry: clicksByCountryFormatted,
      clicksByDevice: clicksByDeviceFormatted,
      clicksByBrowser: clicksByBrowserFormatted,
      referrers: referrers.map((r) => r.referrer).filter(Boolean) as string[],
    };
  },

  async getProfileStats(profileId: string, startDate?: Date, endDate?: Date, includeBots = false) {
    const links = await db.link.findMany({
      where: { profileId },
      select: { id: true },
    });

    const linkIds = links.map((l) => l.id);
    
    const where: Prisma.LinkClickWhereInput = {
      linkId: { in: linkIds },
      ...(includeBots ? {} : { isBot: false }),
    };
    
    if (startDate || endDate) {
      where.clickedAt = {};
      if (startDate) where.clickedAt.gte = startDate;
      if (endDate) where.clickedAt.lte = endDate;
    }

    const [totalClicks, clicksByLink, allClicks] = await Promise.all([
      db.linkClick.count({ where }),
      db.linkClick.groupBy({
        by: ["linkId"],
        where,
        _count: true,
        orderBy: { _count: { linkId: "desc" } },
      }),
      db.linkClick.findMany({
        where,
        select: { clickedAt: true },
        orderBy: { clickedAt: "asc" },
      }),
    ]);

    const topLinks = clicksByLink
      .map((item) => ({
        link_id: item.linkId,
        clicks: item._count,
      }))
      .slice(0, 10);

    const clicksByDate = new Map<string, number>();
    allClicks.forEach((click) => {
      const date = click.clickedAt.toISOString().split("T")[0];
      clicksByDate.set(date, (clicksByDate.get(date) || 0) + 1);
    });

    const clicksOverTimeFormatted = Array.from(clicksByDate.entries())
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      profileId,
      totalClicks,
      topLinks,
      clicksOverTime: clicksOverTimeFormatted,
    };
  },

  async getLinkClickCount(linkId: string, includeBots = false): Promise<number> {
    return db.linkClick.count({ 
      where: { 
        linkId,
        ...(includeBots ? {} : { isBot: false }),
      } 
    });
  },

  async getLinksClickCounts(linkIds: string[], includeBots = false): Promise<Record<string, number>> {
    const counts = await db.linkClick.groupBy({
      by: ["linkId"],
      where: { 
        linkId: { in: linkIds },
        ...(includeBots ? {} : { isBot: false }),
      },
      _count: true,
    });

    const result: Record<string, number> = {};
    linkIds.forEach((id) => {
      result[id] = 0;
    });
    counts.forEach((item) => {
      result[item.linkId] = item._count;
    });

    return result;
  },
};

