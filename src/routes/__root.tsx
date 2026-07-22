import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/clerk-react";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mountain Hawk Freight — Direct. Reliable. Connected." },
      {
        name: "description",
        content:
          "A digital freight-matching platform connecting independent truckers directly with shippers and brokers. No dispatching license needed.",
      },
      { property: "og:title", content: "Mountain Hawk Freight — Direct. Reliable. Connected." },
      {
        property: "og:description",
        content:
          "Find your next load in seconds. Built for owner-operators.",
      },
      { property: "og:image", content: "/mountain-hawk-og-image.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/mountain-hawk-icon.svg" },
      { rel: "apple-touch-icon", href: "/mountain-hawk-icon.png" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-bold text-brand-navy">404</h1>
      <p className="text-lg text-gray-600">Page not found</p>
      <Link
        to="/"
        className="rounded-lg bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
      >
        Back to Home
      </Link>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-off-white font-sans text-charcoal antialiased">
        {PUBLISHABLE_KEY ? (
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
        <Scripts />
      </body>
    </html>
  );
}