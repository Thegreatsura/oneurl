"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "redirecting">("checking");
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      if (attempts >= maxAttempts) {
        router.push("/login");
        return;
      }

      try {
        const { data: session } = await authClient.getSession();
        
        if (session?.user) {
          setStatus("redirecting");
          
          try {
            const response = await fetch("/api/profile/check-onboarded", {
              method: "GET",
              credentials: "include",
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.isOnboarded) {
                router.replace("/dashboard");
              } else {
                router.replace("/onboarding/username");
              }
            } else {
              router.replace("/onboarding/username");
            }
          } catch (error) {
            console.error("Failed to check onboarding status:", error);
            router.replace("/onboarding/username");
          }
        } else {
          setAttempts(prev => prev + 1);
          setTimeout(() => {
            checkSessionAndRedirect();
          }, 300);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/login");
      }
    };

    checkSessionAndRedirect();
  }, [router, attempts]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent"></div>
        <p className="text-sm text-zinc-600">
          {status === "checking" ? "Verifying your account..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}

