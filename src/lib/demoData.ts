/**
 * Demo mode sample data.
 *
 * These are hardcoded, DB-free payloads used by the trucker/shipper dashboards
 * when `?demo=true`. They exist so the demo renders fully in production, where
 * the `team-db` CLI is not available. Types are imported type-only from `~/lib/db`
 * so nothing here pulls in `node:child_process` (or any other server dependency)
 * on the client.
 */

import type { Contract, Load } from "~/lib/db";

export type DemoContract = Contract & { load?: Load | null };

/** YYYY-MM-DD, `days` offset from today. */
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD HH:MM:SS", `days` offset from today (used for created_at/updated_at). */
function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function makeLoad(input: Partial<Load> & Pick<Load, "id" | "title" | "origin_city" | "origin_state" | "dest_city" | "dest_state" | "rate_amount" | "status">): Load {
  return {
    shipper_id: "demo-shipper-id",
    description: null,
    pickup_date: dateOffset(1),
    delivery_date: dateOffset(3),
    weight: 42000,
    equipment_type: "dry_van",
    rate_type: "flat",
    tracking_info: null,
    created_at: isoOffset(-2),
    updated_at: isoOffset(-2),
    ...input,
  };
}

// ---------------------------------------------------------------------------
// Trucker demo — available loads shown on the load board
// ---------------------------------------------------------------------------

export const DEMO_AVAILABLE_LOADS: Load[] = [
  makeLoad({
    id: "demo-load-1001",
    title: "Dry Van — Chicago to Atlanta",
    description: "48-ft dry van, palletized general freight. No hazmat.",
    origin_city: "Chicago",
    origin_state: "IL",
    dest_city: "Atlanta",
    dest_state: "GA",
    pickup_date: dateOffset(1),
    delivery_date: dateOffset(3),
    weight: 42000,
    equipment_type: "dry_van",
    rate_amount: 2100,
    rate_type: "flat",
    status: "available",
  }),
  makeLoad({
    id: "demo-load-1002",
    title: "Reefer — Dallas to Denver",
    description: "Temperature-controlled produce. Must maintain 34°F.",
    origin_city: "Dallas",
    origin_state: "TX",
    dest_city: "Denver",
    dest_state: "CO",
    pickup_date: dateOffset(2),
    delivery_date: dateOffset(4),
    weight: 38000,
    equipment_type: "reefer",
    rate_amount: 2650,
    rate_type: "flat",
    status: "available",
  }),
  makeLoad({
    id: "demo-load-1003",
    title: "Flatbed — Phoenix to Las Vegas",
    description: "Steel beams, tarping required. 48-ft flatbed.",
    origin_city: "Phoenix",
    origin_state: "AZ",
    dest_city: "Las Vegas",
    dest_state: "NV",
    pickup_date: dateOffset(1),
    delivery_date: dateOffset(2),
    weight: 30000,
    equipment_type: "flatbed",
    rate_amount: 1450,
    rate_type: "flat",
    status: "available",
  }),
  makeLoad({
    id: "demo-load-1004",
    title: "Step Deck — Columbus to Nashville",
    description: "Construction equipment, 10-ft height clearance needed.",
    origin_city: "Columbus",
    origin_state: "OH",
    dest_city: "Nashville",
    dest_state: "TN",
    pickup_date: dateOffset(3),
    delivery_date: dateOffset(5),
    weight: 34000,
    equipment_type: "step_deck",
    rate_amount: 2250,
    rate_type: "per_mile",
    status: "available",
  }),
];

// ---------------------------------------------------------------------------
// Trucker demo — booked loads ("My Loads" tab) + stats
// ---------------------------------------------------------------------------

export const DEMO_TRUCKER_CONTRACTS: DemoContract[] = [
  {
    id: "demo-contract-2001",
    load_id: "demo-load-2001",
    trucker_id: "demo-trucker-id",
    shipper_id: "demo-shipper-id",
    rate_amount: 1850,
    commission_percent: 8,
    status: "active",
    tracking_info: null,
    created_at: isoOffset(-4),
    updated_at: isoOffset(-1),
    load: makeLoad({
      id: "demo-load-2001",
      title: "Dry Van — Seattle to Portland",
      origin_city: "Seattle",
      origin_state: "WA",
      dest_city: "Portland",
      dest_state: "OR",
      pickup_date: dateOffset(-1),
      delivery_date: dateOffset(1),
      weight: 41000,
      equipment_type: "dry_van",
      rate_amount: 1850,
      rate_type: "flat",
      status: "in_transit",
      tracking_info: "GPS: http://track.mountainhawkfreight.com/demo-2001",
    }),
  },
  {
    id: "demo-contract-2002",
    load_id: "demo-load-2002",
    trucker_id: "demo-trucker-id",
    shipper_id: "demo-shipper-id",
    rate_amount: 2400,
    commission_percent: 8,
    status: "completed",
    tracking_info: null,
    created_at: isoOffset(-10),
    updated_at: isoOffset(-6),
    load: makeLoad({
      id: "demo-load-2002",
      title: "Flatbed — Houston to New Orleans",
      origin_city: "Houston",
      origin_state: "TX",
      dest_city: "New Orleans",
      dest_state: "LA",
      pickup_date: dateOffset(-9),
      delivery_date: dateOffset(-7),
      weight: 36000,
      equipment_type: "flatbed",
      rate_amount: 2400,
      rate_type: "flat",
      status: "delivered",
      tracking_info: "Delivered and signed for",
    }),
  },
  {
    id: "demo-contract-2003",
    load_id: "demo-load-2003",
    trucker_id: "demo-trucker-id",
    shipper_id: "demo-shipper-id",
    rate_amount: 980,
    commission_percent: 8,
    status: "pending",
    tracking_info: null,
    created_at: isoOffset(-1),
    updated_at: isoOffset(-1),
    load: makeLoad({
      id: "demo-load-2003",
      title: "Reefer — Miami to Orlando",
      origin_city: "Miami",
      origin_state: "FL",
      dest_city: "Orlando",
      dest_state: "FL",
      pickup_date: dateOffset(1),
      delivery_date: dateOffset(2),
      weight: 25000,
      equipment_type: "reefer",
      rate_amount: 980,
      rate_type: "flat",
      status: "assigned",
      tracking_info: null,
    }),
  },
];

// ---------------------------------------------------------------------------
// Shipper demo — posted loads + contracts
// ---------------------------------------------------------------------------

export const DEMO_SHIPPER_LOADS: Load[] = [
  makeLoad({
    id: "demo-load-1001",
    title: "Dry Van — Chicago to Atlanta",
    origin_city: "Chicago",
    origin_state: "IL",
    dest_city: "Atlanta",
    dest_state: "GA",
    pickup_date: dateOffset(1),
    delivery_date: dateOffset(3),
    weight: 42000,
    equipment_type: "dry_van",
    rate_amount: 2100,
    rate_type: "flat",
    status: "available",
  }),
  makeLoad({
    id: "demo-load-1002",
    title: "Reefer — Dallas to Denver",
    origin_city: "Dallas",
    origin_state: "TX",
    dest_city: "Denver",
    dest_state: "CO",
    pickup_date: dateOffset(2),
    delivery_date: dateOffset(4),
    weight: 38000,
    equipment_type: "reefer",
    rate_amount: 2650,
    rate_type: "flat",
    status: "available",
  }),
  makeLoad({
    id: "demo-load-3001",
    title: "Dry Van — Seattle to Portland",
    origin_city: "Seattle",
    origin_state: "WA",
    dest_city: "Portland",
    dest_state: "OR",
    pickup_date: dateOffset(-1),
    delivery_date: dateOffset(1),
    weight: 41000,
    equipment_type: "dry_van",
    rate_amount: 1850,
    rate_type: "flat",
    status: "in_transit",
    tracking_info: "GPS: http://track.mountainhawkfreight.com/demo-2001",
  }),
  makeLoad({
    id: "demo-load-3002",
    title: "Flatbed — Houston to New Orleans",
    origin_city: "Houston",
    origin_state: "TX",
    dest_city: "New Orleans",
    dest_state: "LA",
    pickup_date: dateOffset(-9),
    delivery_date: dateOffset(-7),
    weight: 36000,
    equipment_type: "flatbed",
    rate_amount: 2400,
    rate_type: "flat",
    status: "delivered",
    tracking_info: "Delivered and signed for",
  }),
];

export const DEMO_SHIPPER_CONTRACTS: Contract[] = [
  {
    id: "demo-contract-2001",
    load_id: "demo-load-3001",
    trucker_id: "demo-trucker-id",
    shipper_id: "demo-shipper-id",
    rate_amount: 1850,
    commission_percent: 8,
    status: "active",
    tracking_info: null,
    created_at: isoOffset(-4),
    updated_at: isoOffset(-1),
  },
  {
    id: "demo-contract-2002",
    load_id: "demo-load-3002",
    trucker_id: "demo-trucker-id",
    shipper_id: "demo-shipper-id",
    rate_amount: 2400,
    commission_percent: 8,
    status: "completed",
    tracking_info: null,
    created_at: isoOffset(-10),
    updated_at: isoOffset(-6),
  },
];
