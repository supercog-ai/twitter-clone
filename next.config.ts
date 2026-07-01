import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    serverActions: {
      // Allow image uploads up to ~5MB through Server Actions.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
