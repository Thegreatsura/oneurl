import { BarChart3, TrendingUp, Globe, Monitor, Smartphone } from "lucide-react";
import { requireAuth } from "@/lib/auth-guard";
import { analyticsService } from "@/lib/services/analytics.service";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

export default async function AnalyticsPage() {
  const session = await requireAuth();
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: { links: true },
  });

  if (!profile) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your link performance
          </p>
        </div>
        <Card>
          <CardContent className="p-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3 />
                </EmptyMedia>
                <EmptyTitle>No profile found</EmptyTitle>
                <EmptyDescription>
                  Create a profile to start tracking analytics.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = await analyticsService.getProfileStats(profile.id);

  const topLinksWithDetails = stats.topLinks
    .map((item) => {
      const link = profile.links.find((l) => l.id === item.link_id);
      return {
        ...item,
        title: link?.title || "Unknown",
        url: link?.url || "",
      };
    })
    .slice(0, 10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your link performance and understand your audience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{stats.totalClicks}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">
                {profile.links.filter((l) => l.isActive).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{profile.links.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Clicks per Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">
                {profile.links.length > 0
                  ? Math.round((stats.totalClicks / profile.links.length) * 10) / 10
                  : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
          </CardHeader>
          <CardContent>
            {topLinksWithDetails.length > 0 ? (
              <div className="space-y-4">
                {topLinksWithDetails.map((item, index) => (
                  <div key={item.link_id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <p className="text-sm font-medium truncate">{item.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {item.url}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold">{item.clicks}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.clicks === 1 ? "click" : "clicks"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BarChart3 />
                  </EmptyMedia>
                  <EmptyTitle>No data yet</EmptyTitle>
                  <EmptyDescription>
                    Start sharing your links to see analytics data here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clicksOverTime.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Clicks over the last {Math.min(stats.clicksOverTime.length, 7)} days
                </p>
                <div className="space-y-2">
                  {stats.clicksOverTime.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${
                                (item.clicks / Math.max(...stats.clicksOverTime.map((i) => i.clicks), 1)) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {item.clicks}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TrendingUp />
                  </EmptyMedia>
                  <EmptyTitle>No activity yet</EmptyTitle>
                  <EmptyDescription>
                    Click data will appear here as visitors interact with your links.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

