/**
 * Demo mode helpers and constants
 *
 * Client-safe: constants (DEMO_CLERK_ID, etc.) are safe to import client-side.
 * Server-only: ensureDemoUsers() uses execSync — only call inside createServerFn handlers.
 */
import { execSync } from "node:child_process";

export const DEMO_CLERK_ID = "demo-user";
export const DEMO_SHIPPER_ID = "demo-shipper-id";
export const DEMO_TRUCKER_ID = "demo-trucker-id";

function db<T>(sql: string): T[] {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `team-db "${escaped}"`;
  const raw = execSync(cmd, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
  return JSON.parse(raw) as T[];
}

export function ensureDemoUsers(): void {
  const existingShipper = db<{ id: string }>(`SELECT id FROM users WHERE clerk_id = '${DEMO_CLERK_ID}-shipper'`);
  if (existingShipper.length === 0) {
    db(`INSERT INTO users (id, clerk_id, email, first_name, last_name, role, is_pro) VALUES ('${DEMO_SHIPPER_ID}', '${DEMO_CLERK_ID}-shipper', 'demo-shipper@freightlink.app', 'Demo', 'Shipper', 'shipper', 1)`);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const expiresStr = futureDate.toISOString().replace("T", " ").slice(0, 19);
    db(`UPDATE users SET pro_expires_at = '${expiresStr}' WHERE id = '${DEMO_SHIPPER_ID}'`);
  }
  const existingTrucker = db<{ id: string }>(`SELECT id FROM users WHERE clerk_id = '${DEMO_CLERK_ID}-trucker'`);
  if (existingTrucker.length === 0) {
    db(`INSERT INTO users (id, clerk_id, email, first_name, last_name, role, is_pro) VALUES ('${DEMO_TRUCKER_ID}', '${DEMO_CLERK_ID}-trucker', 'demo-trucker@freightlink.app', 'Demo', 'Trucker', 'trucker', 1)`);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const expiresStr = futureDate.toISOString().replace("T", " ").slice(0, 19);
    db(`UPDATE users SET pro_expires_at = '${expiresStr}' WHERE id = '${DEMO_TRUCKER_ID}'`);
  }
}