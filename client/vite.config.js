import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During local development, `npm run dev` (Vite on :5173) proxies API and
// auth calls to Express on :5000, so cookies + fetch behave the same way
// they will in production once Express serves the built client itself.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/auth": { target: "http://localhost:5000", changeOrigin: true },
      "/login": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
