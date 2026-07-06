/**
 * FreightLink Authentication Layer
 *
 * Clerk-based auth utilities for route protection and session management.
 */

import { verifyToken } from "@clerk/backend";
import { getLoadsByShipper, getContractsByShipper, getContractsByTrucker } from "./db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "trucker" | "shipper" | "broker";
}

export interface RequestLike {
  headers: Headers;
}

// ---------------------------------------------------------------------------
// Session helpers (server-only — call inside createServerFn handlers)
// ---------------------------------------------------------------------------

/**
 * Extract the Clerk session token from the request.
 */
export function getSessionToken(request: RequestLike): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookie = request.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/__session=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Verify a Clerk session token and return the user info.
 */
export async function verifyAuthSession(
  token: string,
): Promise<{ sub: string } | null> {
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    return { sub: payload.sub };
  } catch (err) {
    console.error("[FreightLink Auth] Token verification failed:", err);
    return null;
  }
}

/**
 * Get the authenticated user's Clerk ID from a server function request.
 */
export async function getAuth(
  request: RequestLike,
): Promise<{ clerkId: string } | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const payload = await verifyAuthSession(token);
  if (!payload) return null;
  return { clerkId: payload.sub };
}

/**
 * Wraps a handler to require authentication. Throws if no valid session.
 */
export function requireAuth<T>(
  handler: (clerkId: string) => Promise<T>,
): (request: RequestLike) => Promise<T> {
  return async (request: RequestLike) => {
    const auth = await getAuth(request);
    if (!auth) {
      throw new Error("Unauthorized — please sign in");
    }
    return handler(auth.clerkId);
  };
}

// ---------------------------------------------------------------------------
// Client-side helpers
// ---------------------------------------------------------------------------

/**
 * Returns the Clerk publishable key for client-side initialization.
 */
export function getClerkPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    process.env.CLERK_PUBLISHABLE_KEY ??
    ""
  );
}

/**
 * Returns true if Clerk env vars are configured.
 */
export function isClerkConfigured(): boolean {
  return !!(process.env.CLERK_SECRET_KEY && getClerkPublishableKey());
}

// ---------------------------------------------------------------------------
// RBAC helpers
// ---------------------------------------------------------------------------

export function isTrucker(role: string): boolean {
  return role === "trucker";
}

export function isShipper(role: string): boolean {
  return role === "shipper";
}

export function isBroker(role: string): boolean {
  return role === "broker";
}

export function canPostLoads(role: string): boolean {
  return role === "shipper" || role === "broker";
}

export function canHaulLoads(role: string): boolean {
  return role === "trucker";
}