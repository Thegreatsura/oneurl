"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Link } from "@/lib/hooks/use-links";
import { getDomainIcon } from "@/lib/utils/og-image";
import { LinkIcon } from "@/components/link-icon";

interface MainLinkProps {
  link: Link;
  onClick?: () => void;
  showDescription?: boolean;
  description?: string | null;
}

interface LinkPreview {
  image: string | null;
  logo: string | null;
}

export function MainLink({ link, onClick, showDescription = false, description }: MainLinkProps) {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const domainIcon = getDomainIcon(link.url);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(link.url)}`);
        if (response.ok && isMounted) {
          const data = await response.json();
          setPreview({ image: data.image, logo: data.logo });
        }
      } catch (error) {
        console.error("Failed to fetch preview:", error);
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [link.url]);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="relative rounded-xl border border-zinc-200 bg-white transition-all cursor-pointer hover:border-zinc-300 hover:shadow-sm block overflow-hidden group"
    >
      {preview?.image && (
        <div className="w-full h-48 bg-zinc-100 relative overflow-hidden">
          <Image
            src={preview.image}
            alt={link.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="flex gap-4 p-4">
        <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-200">
          {preview?.logo ? (
            <LinkIcon src={preview.logo} className="w-10 h-10" />
          ) : domainIcon ? (
            <LinkIcon src={domainIcon} className="w-10 h-10" />
          ) : (
            <div className="w-10 h-10 bg-zinc-300 rounded" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-sm font-semibold text-zinc-900 truncate group-hover:text-zinc-700">
            {link.title}
          </h4>
          <p className="text-xs text-zinc-500 truncate">{link.url}</p>
          {showDescription && description && (
            <p className="text-xs text-zinc-600 line-clamp-2 mt-1.5">
              {description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

