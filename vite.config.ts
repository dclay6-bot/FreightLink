import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 3000,
      host: true,
      // The site is reverse-proxied behind <label>.<PUBLIC_SITE_DOMAIN>; the proxy
      // masks the Host to localhost:3000, but accept any host so a dev server never
      // rejects a proxied request with "Blocked request".
      allowedHosts: true,
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tanstackStart(),
      viteReact(),
    ],
    define: {
      "process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": JSON.stringify(
        env.CLERK_PUBLISHABLE_KEY || env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
      ),
      "process.env.CLERK_SECRET_KEY": JSON.stringify(
        env.CLERK_SECRET_KEY || "",
      ),
    },
  };
});
