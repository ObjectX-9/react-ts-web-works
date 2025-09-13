import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: "es",
  },
  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === "production" ? "/webwork/" : "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // 确保静态资源正确处理
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          worker: ["./src/workers/calculator.worker.ts"],
        },
      },
    },
  },
});
