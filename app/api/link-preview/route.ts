import { NextResponse } from "next/server";
import urlMetadata from "url-metadata";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    let validUrl: string;
    try {
      const urlObj = new URL(url);
      validUrl = urlObj.toString();
    } catch {
      try {
        validUrl = new URL(`https://${url}`).toString();
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    const metadata = await urlMetadata(validUrl, {
      timeout: 10000,
      requestHeaders: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    let favicon: string | null = null;
    if (metadata.favicons && Array.isArray(metadata.favicons) && metadata.favicons.length > 0) {
      const firstFavicon = metadata.favicons[0];
      if (typeof firstFavicon === "string") {
        favicon = firstFavicon;
      } else if (firstFavicon && typeof firstFavicon === "object" && "href" in firstFavicon) {
        favicon = firstFavicon.href as string;
      }
    }

    return NextResponse.json({
      title: metadata["og:title"] || metadata.title || null,
      description: metadata["og:description"] || metadata.description || null,
      image: metadata["og:image"] || metadata.image || null,
      logo: metadata["og:logo"] || metadata.logo || favicon || null,
      url: validUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timeout" },
        { status: 408 }
      );
    }

    console.error("Error fetching link preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch link preview" },
      { status: 500 }
    );
  }
}

