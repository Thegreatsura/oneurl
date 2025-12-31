import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { linkService } from "@/lib/services/link.service";
import { db } from "@/lib/db";
import { linkSchema } from "@/lib/validations/schemas";

export async function GET() {
  try {
    const session = await requireAuth();
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ links: [] });
    }

    const links = await linkService.getByProfileId(profile.id);

    return NextResponse.json({ links });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    let profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await db.profile.create({
        data: { userId: session.user.id },
      });
    }

    if (body.links && Array.isArray(body.links)) {
      await db.link.deleteMany({
        where: { profileId: profile.id },
      });

      const createdLinks = await Promise.all(
        body.links.map(
          (
            link: { title: string; url: string; icon?: string },
            index: number
          ) =>
            linkService
              .create(profile.id, {
                title: link.title,
                url: link.url,
                icon: link.icon,
              })
              .then((created) =>
                db.link.update({
                  where: { id: created.id },
                  data: { position: index },
                })
              )
        )
      );

      return NextResponse.json({ links: createdLinks });
    }

    const validated = linkSchema.parse(body);
    const link = await linkService.create(profile.id, validated);

    return NextResponse.json({ link });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create link" },
      { status: 500 }
    );
  }
}
