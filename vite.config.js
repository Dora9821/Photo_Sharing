import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Thêm dòng này để cho phép chạy trên CodeSandbox
    allowedHosts: [".csb.app"],
    proxy: {
      "/user": "http://localhost:8081",
      "/photosOfUser": "http://localhost:8081",
    },
  },
});
