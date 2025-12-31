const TINYBIRD_HOST = process.env.TINYBIRD_HOST ;
const TINYBIRD_TOKEN = process.env.TINYBIRD_TOKEN || "";

export interface ClickEvent {
  link_id: string;
  profile_id: string;
  timestamp: string;
  referrer?: string;
  country?: string;
  device?: string;
  browser?: string;
}

export async function trackClick(data: {
  linkId: string;
  profileId: string;
  referrer?: string;
  country?: string;
  device?: string;
  browser?: string;
}): Promise<boolean> {
  if (!TINYBIRD_TOKEN) {
    return false;
  }

  const event: ClickEvent = {
    link_id: data.linkId,
    profile_id: data.profileId,
    timestamp: new Date().toISOString(),
    referrer: data.referrer,
    country: data.country,
    device: data.device,
    browser: data.browser,
  };

  try {
    const response = await fetch(`${TINYBIRD_HOST}/v0/events?name=clicks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TINYBIRD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    return response.ok || response.status === 202;
  } catch (error) {
    console.error("Failed to track click to Tinybird:", error);
    return false;
  }
}

export async function trackClicksBatch(events: ClickEvent[]): Promise<boolean> {
  if (!TINYBIRD_TOKEN || events.length === 0) {
    return false;
  }

  const ndjson = events.map((e) => JSON.stringify(e)).join("\n");

  try {
    const response = await fetch(`${TINYBIRD_HOST}/v0/events?name=clicks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TINYBIRD_TOKEN}`,
        "Content-Type": "application/x-ndjson",
      },
      body: ndjson,
    });

    return response.ok || response.status === 202;
  } catch (error) {
    console.error("Failed to track clicks batch to Tinybird:", error);
    return false;
  }
}

export async function queryTinybird(
  pipe: string,
  params?: Record<string, string | undefined>
): Promise<Record<string, unknown>[] | null> {
  if (!TINYBIRD_TOKEN) {
    return null;
  }

  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([, value]) => value !== undefined)
    );
    const queryParams = new URLSearchParams(
      filteredParams as Record<string, string>
    );
    const response = await fetch(
      `${TINYBIRD_HOST}/v0/pipes/${pipe}.json?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${TINYBIRD_TOKEN}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch (error) {
    console.error(`Failed to query Tinybird pipe ${pipe}:`, error);
  }

  return null;
}

