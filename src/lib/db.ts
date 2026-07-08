/**
 * FreightLink Database Layer
 *
 * Server-side database helper functions using team-db CLI via the Turso-shared SQLite database.
 * These are server-only utilities — import and use them inside createServerFn() handlers.
 */

import { execSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  clerk_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "trucker" | "shipper" | "broker";
  company_name: string | null;
  dot_number: string | null;
  is_pro: number | null;
  pro_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Load {
  id: string;
  shipper_id: string;
  title: string;
  description: string | null;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  pickup_date: string;
  delivery_date: string;
  weight: number | null;
  equipment_type: string | null;
  rate_amount: number;
  rate_type: "flat" | "per_mile";
  status: "available" | "assigned" | "in_transit" | "delivered" | "cancelled";
  tracking_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  load_id: string;
  trucker_id: string;
  shipper_id: string;
  rate_amount: number;
  commission_percent: number;
  status: "pending" | "active" | "completed" | "cancelled";
  tracking_info: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function db<T>(sql: string): T[] {
  // Escape double-quotes inside the SQL string for the shell
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `team-db "${escaped}"`;
  try {
    const raw = execSync(cmd, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(raw) as T[];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Database query failed: ${message}`);
  }
}

function uuid(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUser(id: string): User | null {
  const rows = db<User>(`SELECT * FROM users WHERE id = '${id}'`);
  return rows[0] ?? null;
}

export function getUserByEmail(email: string): User | null {
  const rows = db<User>(`SELECT * FROM users WHERE email = '${email}'`);
  return rows[0] ?? null;
}

export function getUserByClerkId(clerkId: string): User | null {
  const rows = db<User>(`SELECT * FROM users WHERE clerk_id = '${clerkId}'`);
  return rows[0] ?? null;
}

export function createUser(input: {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "trucker" | "shipper" | "broker";
  clerk_id?: string;
  company_name?: string;
  dot_number?: string;
}): User {
  const id = uuid();
  const clerkId = input.clerk_id ? `'${input.clerk_id}'` : "NULL";
  const phone = input.phone ? `'${input.phone}'` : "NULL";
  const company = input.company_name ? `'${input.company_name}'` : "NULL";
  const dot = input.dot_number ? `'${input.dot_number}'` : "NULL";

  db(
    `INSERT INTO users (id, clerk_id, email, first_name, last_name, phone, role, company_name, dot_number) VALUES ('${id}', ${clerkId}, '${input.email}', '${input.first_name}', '${input.last_name}', ${phone}, '${input.role}', ${company}, ${dot})`,
  );
  return getUser(id)!;
}

export function updateUser(
  id: string,
  updates: Partial<Pick<User, "email" | "first_name" | "last_name" | "phone" | "company_name" | "dot_number" | "clerk_id">>,
): User | null {
  const setClauses: string[] = ["updated_at = datetime('now')"];
  if (updates.email !== undefined) setClauses.push(`email = '${updates.email}'`);
  if (updates.first_name !== undefined) setClauses.push(`first_name = '${updates.first_name}'`);
  if (updates.last_name !== undefined) setClauses.push(`last_name = '${updates.last_name}'`);
  if (updates.phone !== undefined) setClauses.push(`phone = '${updates.phone}'`);
  if (updates.company_name !== undefined) setClauses.push(`company_name = '${updates.company_name}'`);
  if (updates.dot_number !== undefined) setClauses.push(`dot_number = '${updates.dot_number}'`);
  if (updates.clerk_id !== undefined) setClauses.push(`clerk_id = '${updates.clerk_id}'`);

  db(`UPDATE users SET ${setClauses.join(", ")} WHERE id = '${id}'`);
  return getUser(id);
}

// ---------------------------------------------------------------------------
// Pro Subscription
// ---------------------------------------------------------------------------

export function isUserPro(userId: string): boolean {
  const user = getUser(userId);
  if (!user || !user.is_pro) return false;
  if (!user.pro_expires_at) return false;
  return new Date(user.pro_expires_at) > new Date();
}

export function setUserPro(userId: string, days: number): User | null {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  const expiresStr = expires.toISOString().replace("T", " ").slice(0, 19);
  db(`UPDATE users SET is_pro = 1, pro_expires_at = '${expiresStr}', updated_at = datetime('now') WHERE id = '${userId}'`);
  return getUser(userId);
}

export function getProTruckers(): User[] {
  return db<User>("SELECT * FROM users WHERE role = 'trucker' AND is_pro = 1 AND pro_expires_at > datetime('now') ORDER BY pro_expires_at DESC");
}

export function getCommissionPercent(userId: string): number {
  return isUserPro(userId) ? 8 : 10;
}

// ---------------------------------------------------------------------------
// Loads
// ---------------------------------------------------------------------------

export function getLoad(id: string): Load | null {
  const rows = db<Load>(`SELECT * FROM loads WHERE id = '${id}'`);
  return rows[0] ?? null;
}

export function getLoads(filters?: {
  status?: string;
  equipment_type?: string;
  origin_state?: string;
  dest_state?: string;
  limit?: number;
  offset?: number;
}): Load[] {
  const conditions: string[] = [];
  if (filters?.status) conditions.push(`status = '${filters.status}'`);
  if (filters?.equipment_type) conditions.push(`equipment_type = '${filters.equipment_type}'`);
  if (filters?.origin_state) conditions.push(`origin_state = '${filters.origin_state}'`);
  if (filters?.dest_state) conditions.push(`dest_state = '${filters.dest_state}'`);

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  return db<Load>(`SELECT * FROM loads ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`);
}

export function getLoadsByShipper(shipperId: string): Load[] {
  return db<Load>(`SELECT * FROM loads WHERE shipper_id = '${shipperId}' ORDER BY created_at DESC`);
}

export function getAvailableLoads(): Load[] {
  return db<Load>("SELECT * FROM loads WHERE status = 'available' ORDER BY created_at DESC");
}

export function createLoad(input: {
  shipper_id: string;
  title: string;
  description?: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  pickup_date: string;
  delivery_date: string;
  weight?: number;
  equipment_type?: string;
  rate_amount: number;
  rate_type?: "flat" | "per_mile";
}): Load {
  const id = uuid();
  const desc = input.description ? `'${input.description}'` : "NULL";
  const weight = input.weight !== undefined ? input.weight : "NULL";
  const equip = input.equipment_type ? `'${input.equipment_type}'` : "NULL";
  const rateType = input.rate_type ?? "flat";

  db(
    `INSERT INTO loads (id, shipper_id, title, description, origin_city, origin_state, dest_city, dest_state, pickup_date, delivery_date, weight, equipment_type, rate_amount, rate_type) VALUES ('${id}', '${input.shipper_id}', '${input.title}', ${desc}, '${input.origin_city}', '${input.origin_state}', '${input.dest_city}', '${input.dest_state}', '${input.pickup_date}', '${input.delivery_date}', ${weight}, ${equip}, ${input.rate_amount}, '${rateType}')`,
  );
  return getLoad(id)!;
}

export function updateLoad(id: string, updates: Partial<Pick<Load, "title" | "description" | "origin_city" | "origin_state" | "dest_city" | "dest_state" | "pickup_date" | "delivery_date" | "weight" | "equipment_type" | "rate_amount" | "rate_type" | "status" | "tracking_info">>): Load | null {
  const setClauses: string[] = ["updated_at = datetime('now')"];
  if (updates.title !== undefined) setClauses.push(`title = '${updates.title}'`);
  if (updates.description !== undefined) setClauses.push(`description = '${updates.description}'`);
  if (updates.origin_city !== undefined) setClauses.push(`origin_city = '${updates.origin_city}'`);
  if (updates.origin_state !== undefined) setClauses.push(`origin_state = '${updates.origin_state}'`);
  if (updates.dest_city !== undefined) setClauses.push(`dest_city = '${updates.dest_city}'`);
  if (updates.dest_state !== undefined) setClauses.push(`dest_state = '${updates.dest_state}'`);
  if (updates.pickup_date !== undefined) setClauses.push(`pickup_date = '${updates.pickup_date}'`);
  if (updates.delivery_date !== undefined) setClauses.push(`delivery_date = '${updates.delivery_date}'`);
  if (updates.weight !== undefined) setClauses.push(`weight = ${updates.weight}`);
  if (updates.equipment_type !== undefined) setClauses.push(`equipment_type = '${updates.equipment_type}'`);
  if (updates.rate_amount !== undefined) setClauses.push(`rate_amount = ${updates.rate_amount}`);
  if (updates.rate_type !== undefined) setClauses.push(`rate_type = '${updates.rate_type}'`);
  if (updates.status !== undefined) setClauses.push(`status = '${updates.status}'`);
  if (updates.tracking_info !== undefined) setClauses.push(`tracking_info = '${updates.tracking_info}'`);

  db(`UPDATE loads SET ${setClauses.join(", ")} WHERE id = '${id}'`);
  return getLoad(id);
}

export function updateLoadStatus(id: string, status: Load["status"]): Load | null {
  db(`UPDATE loads SET status = '${status}', updated_at = datetime('now') WHERE id = '${id}'`);
  return getLoad(id);
}

export function getLoadsByStatusForShipper(shipperId: string, status: string): Load[] {
  return db<Load>(`SELECT * FROM loads WHERE shipper_id = '${shipperId}' AND status = '${status}' ORDER BY created_at DESC`);
}

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------

export function getContract(id: string): Contract | null {
  const rows = db<Contract>(`SELECT * FROM contracts WHERE id = '${id}'`);
  return rows[0] ?? null;
}

export function getContractsByTrucker(truckerId: string): Contract[] {
  return db<Contract>(
    `SELECT * FROM contracts WHERE trucker_id = '${truckerId}' ORDER BY created_at DESC`,
  );
}

export function getContractsByShipper(shipperId: string): Contract[] {
  return db<Contract>(
    `SELECT * FROM contracts WHERE shipper_id = '${shipperId}' ORDER BY created_at DESC`,
  );
}

export function getContractsByLoad(loadId: string): Contract[] {
  return db<Contract>(
    `SELECT * FROM contracts WHERE load_id = '${loadId}' ORDER BY created_at DESC`,
  );
}

export function createContract(input: {
  load_id: string;
  trucker_id: string;
  shipper_id: string;
  rate_amount: number;
  commission_percent?: number;
}): Contract {
  const id = uuid();
  const comm = input.commission_percent ?? 10;

  db(
    `INSERT INTO contracts (id, load_id, trucker_id, shipper_id, rate_amount, commission_percent) VALUES ('${id}', '${input.load_id}', '${input.trucker_id}', '${input.shipper_id}', ${input.rate_amount}, ${comm})`,
  );

  // Mark the load as assigned
  updateLoadStatus(input.load_id, "assigned");

  return getContract(id)!;
}

export function updateContractStatus(
  id: string,
  status: Contract["status"],
): Contract | null {
  db(`UPDATE contracts SET status = '${status}', updated_at = datetime('now') WHERE id = '${id}'`);
  return getContract(id);
}

// ---------------------------------------------------------------------------
// Demo Mode
// ---------------------------------------------------------------------------

export const DEMO_CLERK_ID = "demo-user";
export const DEMO_SHIPPER_ID = "demo-shipper-id";
export const DEMO_TRUCKER_ID = "demo-trucker-id";

export function ensureDemoUsers(): void {
  // Create demo shipper if not exists
  const existingShipper = getUserByClerkId(DEMO_CLERK_ID + "-shipper");
  if (!existingShipper) {
    db(
      `INSERT INTO users (id, clerk_id, email, first_name, last_name, role, is_pro) VALUES ('${DEMO_SHIPPER_ID}', '${DEMO_CLERK_ID}-shipper', 'demo-shipper@freightlink.app', 'Demo', 'Shipper', 'shipper', 1)`,
    );
    // Ensure pro expiry is set
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const expiresStr = futureDate.toISOString().replace("T", " ").slice(0, 19);
    db(`UPDATE users SET pro_expires_at = '${expiresStr}' WHERE id = '${DEMO_SHIPPER_ID}'`);
  }

  // Create demo trucker if not exists
  const existingTrucker = getUserByClerkId(DEMO_CLERK_ID + "-trucker");
  if (!existingTrucker) {
    db(
      `INSERT INTO users (id, clerk_id, email, first_name, last_name, role, is_pro) VALUES ('${DEMO_TRUCKER_ID}', '${DEMO_CLERK_ID}-trucker', 'demo-trucker@freightlink.app', 'Demo', 'Trucker', 'trucker', 1)`,
    );
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const expiresStr = futureDate.toISOString().replace("T", " ").slice(0, 19);
    db(`UPDATE users SET pro_expires_at = '${expiresStr}' WHERE id = '${DEMO_TRUCKER_ID}'`);
  }
}

export function getDemoUserByRole(role: "trucker" | "shipper"): User | null {
  const clerkIdSuffix = role === "shipper" ? "-shipper" : "-trucker";
  return getUserByClerkId(DEMO_CLERK_ID + clerkIdSuffix);
}