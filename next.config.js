/** @type {import('next').NextConfig} */
const nextConfig = {
  // AlphaTab uses Web Workers and needs specific webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  turbopack: {},
  images: {
    remotePatterns: [new URL('https://gtynqpbhfwluferzqfzl.supabase.co/**')]
  }
};

module.exports = nextConfig;