/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/matchprop',
  assetPrefix: '/matchprop/',
  images: { unoptimized: true },
  trailingSlash: true,
};
module.exports = nextConfig;
