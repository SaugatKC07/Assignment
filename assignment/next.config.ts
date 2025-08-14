import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ correct placement
  },
  /* other config options here */
};

export default nextConfig;
