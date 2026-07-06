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

export function updateLoadStatus(id: string, status: Load["status"]): Load | null {
  db(`UPDATE loads SET status = '${status}', updated_at = datetime('now') WHERE id = '${id}'`);
  return getLoad(id);
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