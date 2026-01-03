import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

const isProduction = process.env.NODE_ENV === "production";
const baseURL = process.env.BETTER_AUTH_URL;

const getTrustedOrigins = (): string[] => {
  const origins: string[] = [];
  
  if (baseURL) {
    origins.push(baseURL);
    
    if (isProduction && baseURL.includes("www.")) {
      const nonWww = baseURL.replace("www.", "");
      origins.push(nonWww);
    } else if (isProduction && !baseURL.includes("www.")) {
      const withWww = baseURL.replace(/^(https?:\/\/)/, "$1www.");
      origins.push(withWww);
    }
  }
  
  if (!isProduction) {
    origins.push("http://localhost:3000");
  }
  
  return origins;
};

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProduction,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

