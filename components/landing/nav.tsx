"use client";

import Link from "next/link";
import Image from "next/image";
import { GitHubStars } from "@/components/github-stars";
import { Button } from "../ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-100/80 backdrop-blur-xl supports-backdrop-filter:bg-zinc-100/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
           <Image 
             src="/logo.png" 
             alt="OneURL Logo" 
             width={128} 
             height={128} 
             className="w-40 h-20"
           />
        </Link>
        
        <div className="hidden md:flex items-center gap-4">
          <Button 
            render={<Link href="/profiles" className="hover:text-foreground transition-colors">Profiles</Link>} 
            variant="ghost"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Profiles
          </Button>
          <Button 
            render={<Link href="/collections" className="hover:text-foreground transition-colors">Collections</Link>} 
            variant="ghost"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Collections
          </Button>
          <Button 
            render={<Link href="/support" className="hover:text-foreground transition-colors">Sponsor OneURL</Link>} 
            variant="ghost"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Sponsor OneURL
          </Button>
          <Button 
            render={<Link href="/login" />} 
            className="text-sm font-medium bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 hover:border-zinc-800 transition-colors"
          >
            Log in
          </Button>
          <GitHubStars repo="KartikLabhshetwar/oneurl" /> 
        </div>

        <button
          className="md:hidden p-2 text-zinc-600 hover:text-zinc-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-zinc-100/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link 
              href="/profiles" 
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profiles
            </Link>
            <Link 
              href="/collections" 
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>
            <Link 
              href="/support" 
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sponsor OneURL
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 hover:border-zinc-800 transition-colors rounded-md text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

