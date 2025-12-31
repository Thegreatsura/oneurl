import { db } from "../db";
import { queryTinybird } from "../tinybird";

export const analyticsService = {
  async getLinkStats(linkId: string, startDate?: Date, endDate?: Date) {
    const params: Record<string, string> = { link_id: linkId };
    
    if (startDate) {
      params.start_date = startDate.toISOString();
    }
    if (endDate) {
      params.end_date = endDate.toISOString();
    }

    const [clicksOverTime, clicksByCountry, clicksByDevice] = await Promise.all([
      queryTinybird("clicks_over_time", params),
      queryTinybird("clicks_by_country", params),
      queryTinybird("clicks_by_device", params),
    ]);

    const totalClicks = clicksOverTime?.reduce(
      (sum: number, item: Record<string, unknown>) =>
        sum + (Number(item.clicks) || 0),
      0
    ) || 0;

    return {
      linkId,
      totalClicks,
      clicksOverTime: clicksOverTime || [],
      clicksByCountry: clicksByCountry || [],
      clicksByDevice: clicksByDevice || [],
    };
  },

  async getProfileStats(profileId: string, startDate?: Date, endDate?: Date) {
    const params: Record<string, string> = { profile_id: profileId };
    
    if (startDate) {
      params.start_date = startDate.toISOString();
    }
    if (endDate) {
      params.end_date = endDate.toISOString();
    }

    const [clicksByLink, clicksOverTime] = await Promise.all([
      queryTinybird("clicks_by_link", params),
      queryTinybird("clicks_over_time", params),
    ]);

    const totalClicks = clicksByLink?.reduce(
      (sum: number, item: Record<string, unknown>) =>
        sum + (Number(item.clicks) || 0),
      0
    ) || 0;

    const topLinks = clicksByLink
      ?.sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) =>
          (Number(b.clicks) || 0) - (Number(a.clicks) || 0)
      )
      .slice(0, 10) || [];

    return {
      profileId,
      totalClicks,
      topLinks,
      clicksOverTime: clicksOverTime || [],
    };
  },
};

