import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  getAvailableLoads,
  getContractsByTrucker,
  getLoads,
  getLoad,
  createContract,
  getUserByClerkId,
  createUser,
  type Load,
  type Contract,
} from "~/lib/db";

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const loadTruckerData = createServerFn({ method: "GET" }).handler(async () => {
  // No auth needed for loading available loads — the client provides userId
  const availableLoads = getAvailableLoads();
  return { availableLoads, contracts: [], activeContracts: 0, completedContracts: 0, totalEarnings: 0 };
});

const loadTruckerContracts = createServerFn({ method: "GET" }).handler(async (data: unknown) => {
  const { clerkId } = data as { clerkId: string };

  let user = getUserByClerkId(clerkId);
  if (!user) {
    user = createUser({
      email: clerkId + "@freightlink.app",
      first_name: "Trucker",
      last_name: "User",
      role: "trucker",
      clerk_id: clerkId,
    });
  }

  const contracts = getContractsByTrucker(user.id);
  const activeContracts = contracts.filter((c) => c.status === "active" || c.status === "pending");
  const completedContracts = contracts.filter((c) => c.status === "completed");

  const totalEarnings = completedContracts.reduce((sum, c) => {
    const commission = c.rate_amount * (c.commission_percent / 100);
    return sum + c.rate_amount - commission;
  }, 0);

  return { contracts, activeContracts: activeContracts.length, completedContracts: completedContracts.length, totalEarnings };
});

const filterAvailableLoads = createServerFn({ method: "GET" }).handler(async (data: unknown) => {
  const filters = data as {
    origin_state?: string;
    dest_state?: string;
    equipment_type?: string;
    min_rate?: number;
  };
  return getLoads({
    status: "available",
    ...(filters.origin_state ? { origin_state: filters.origin_state } : {}),
    ...(filters.dest_state ? { dest_state: filters.dest_state } : {}),
    ...(filters.equipment_type ? { equipment_type: filters.equipment_type } : {}),
    limit: 100,
  });
});

const bookLoad = createServerFn({ method: "POST" }).handler(async (data: unknown) => {
  const { loadId, clerkId } = data as { loadId: string; clerkId: string };

  // Get or create the trucker user record
  let user = getUserByClerkId(clerkId);
  if (!user) {
    user = createUser({
      email: clerkId + "@freightlink.app",
      first_name: "Trucker",
      last_name: "User",
      role: "trucker",
      clerk_id: clerkId,
    });
  }

  // Look up the load
  const load = getLoad(loadId);
  if (!load) throw new Error("Load not found");
  if (load.status !== "available") throw new Error("This load is no longer available");

  // Create the contract with 10% commission
  const contract = createContract({
    load_id: load.id,
    trucker_id: user.id,
    shipper_id: load.shipper_id,
    rate_amount: load.rate_amount,
    commission_percent: 10,
  });

  return { contract, loadTitle: load.title };
});

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/dashboard/trucker")({
  loader: () => loadTruckerData(),
  component: TruckerDashboard,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function TruckerDashboard() {
  const { availableLoads } = Route.useLoaderData();
  const { userId, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"board" | "stats" | "my-loads">("board");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContracts, setActiveContracts] = useState(0);
  const [completedContracts, setCompletedContracts] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [contractsLoaded, setContractsLoaded] = useState(false);

  // Load contracts data when userId is available from Clerk
  useEffect(() => {
    if (userId && !contractsLoaded) {
      loadTruckerContracts({ clerkId: userId }).then((data) => {
        setContracts(data.contracts);
        setActiveContracts(data.activeContracts);
        setCompletedContracts(data.completedContracts);
        setTotalEarnings(data.totalEarnings);
        setContractsLoaded(true);
      });
    }
  }, [userId, contractsLoaded]);

  return (
    <div className="min-h-dvh bg-off-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-light-gray bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src="/freightlink-logo.svg" alt="FreightLink" className="h-8 w-auto" />
            </Link>
            <span className="hidden text-sm font-medium text-brand-amber md:inline">
              Trucker Dashboard
            </span>
          </div>
          <Link to="/" className="btn-ghost text-sm">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 border-b border-light-gray pb-2">
          {[
            { key: "board" as const, label: "Load Board" },
            { key: "stats" as const, label: "My Stats" },
            { key: "my-loads" as const, label: "My Loads" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-brand-amber text-brand-navy"
                  : "text-steel hover:text-brand-navy"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "board" && <LoadBoard initialLoads={availableLoads} clerkId={userId || ""} />}
        {activeTab === "stats" && (
          <StatsTab
            activeContracts={activeContracts}
            completedContracts={completedContracts}
            totalEarnings={totalEarnings}
            contracts={contracts}
          />
        )}
        {activeTab === "my-loads" && <MyLoadsTab contracts={contracts} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Dialog
// ---------------------------------------------------------------------------

function ConfirmDialog({
  load,
  onConfirm,
  onCancel,
  booking,
}: {
  load: Load;
  onConfirm: () => void;
  onCancel: () => void;
  booking: boolean;
}) {
  const commissionPercent = 10;
  const commission = load.rate_amount * (commissionPercent / 100);
  const payout = load.rate_amount - commission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="card max-w-md">
        <h3 className="text-lg font-semibold text-brand-navy">Confirm Booking</h3>
        <p className="mt-2 text-sm text-steel">
          You are about to book this load:
        </p>
        <div className="mt-4 space-y-2 rounded-lg bg-off-white p-4 text-sm">
          <p>
            <span className="font-medium text-charcoal">Route:</span>{" "}
            <span className="text-steel">{load.origin_city}, {load.origin_state} → {load.dest_city}, {load.dest_state}</span>
          </p>
          <p>
            <span className="font-medium text-charcoal">Rate:</span>{" "}
            <span className="text-steel">${load.rate_amount.toLocaleString()} ({load.rate_type === "per_mile" ? "per mile" : "flat rate"})</span>
          </p>
          <p>
            <span className="font-medium text-charcoal">Commission ({commissionPercent}%):</span>{" "}
            <span className="text-steel">-${commission.toLocaleString()}</span>
          </p>
          <p className="border-t border-light-gray pt-2 text-base font-bold text-brand-navy">
            Your payout: ${payout.toLocaleString()}
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onConfirm} disabled={booking} className="btn-primary flex-1">
            {booking ? "Booking..." : "Confirm Booking"}
          </button>
          <button onClick={onCancel} disabled={booking} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success Toast
// ---------------------------------------------------------------------------

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce rounded-lg bg-success-green px-6 py-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">&times;</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Load Board
// ---------------------------------------------------------------------------

function LoadBoard({ initialLoads, clerkId }: { initialLoads: Load[]; clerkId: string }) {
  const [loads, setLoads] = useState(initialLoads);
  const [filters, setFilters] = useState({
    origin_state: "",
    dest_state: "",
    equipment_type: "",
  });
  const [filtering, setFiltering] = useState(false);
  const [confirmingLoad, setConfirmingLoad] = useState<Load | null>(null);
  const [booking, setBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const applyFilters = async () => {
    setFiltering(true);
    try {
      const f: Record<string, string> = {};
      if (filters.origin_state) f.origin_state = filters.origin_state;
      if (filters.dest_state) f.dest_state = filters.dest_state;
      if (filters.equipment_type) f.equipment_type = filters.equipment_type;
      const result = await filterAvailableLoads(f);
      setLoads(result);
    } finally {
      setFiltering(false);
    }
  };

  const clearFilters = () => {
    setFilters({ origin_state: "", dest_state: "", equipment_type: "" });
    setLoads(initialLoads);
  };

  const handleBookLoad = async () => {
    if (!confirmingLoad) return;
    setBooking(true);
    try {
      const result = await bookLoad({ loadId: confirmingLoad.id, clerkId });
      setLoads((prev) => prev.filter((l) => l.id !== confirmingLoad.id));
      setSuccessMsg(`Booked "${result.loadTitle}" successfully!`);
      setConfirmingLoad(null);
    } catch (err) {
      setConfirmingLoad(null);
      alert(err instanceof Error ? err.message : "Failed to book load");
    } finally {
      setBooking(false);
    }
  };

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  ];

  return (
    <div>
      {/* Success toast */}
      {successMsg && <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* Confirm dialog */}
      {confirmingLoad && (
        <ConfirmDialog
          load={confirmingLoad}
          onConfirm={handleBookLoad}
          onCancel={() => setConfirmingLoad(null)}
          booking={booking}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-brand-navy">Load Board</h2>
          <p className="mt-1 text-sm text-steel">Browse available loads. {loads.length} loads currently available.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mt-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-steel">Origin State</label>
            <select
              value={filters.origin_state}
              onChange={(e) => setFilters((p) => ({ ...p, origin_state: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-light-gray px-3 py-2 text-sm focus:border-brand-amber focus:outline-none"
            >
              <option value="">All</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-steel">Destination State</label>
            <select
              value={filters.dest_state}
              onChange={(e) => setFilters((p) => ({ ...p, dest_state: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-light-gray px-3 py-2 text-sm focus:border-brand-amber focus:outline-none"
            >
              <option value="">All</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-steel">Equipment</label>
            <select
              value={filters.equipment_type}
              onChange={(e) => setFilters((p) => ({ ...p, equipment_type: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-light-gray px-3 py-2 text-sm focus:border-brand-amber focus:outline-none"
            >
              <option value="">All</option>
              <option value="dry_van">Dry Van</option>
              <option value="reefer">Reefer</option>
              <option value="flatbed">Flatbed</option>
              <option value="step_deck">Step Deck</option>
              <option value="lowboy">Lowboy</option>
              <option value="tanker">Tanker</option>
              <option value="box_truck">Box Truck</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={applyFilters} disabled={filtering} className="btn-primary flex-1 text-sm">
              {filtering ? "..." : "Filter"}
            </button>
            <button onClick={clearFilters} className="btn-ghost text-sm">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Load Cards */}
      <div className="mt-6 space-y-4">
        {loads.length === 0 ? (
          <div className="card text-center">
            <p className="text-steel">No available loads match your filters.</p>
          </div>
        ) : (
          loads.map((load) => (
            <div key={load.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-brand-navy">{load.title}</h3>
                    <span className="badge-success">Available</span>
                  </div>
                  <p className="mt-1 text-sm text-steel">
                    <span className="font-medium">{load.origin_city}, {load.origin_state}</span>
                    {" → "}
                    <span className="font-medium">{load.dest_city}, {load.dest_state}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-steel">
                    <span>Pickup: {load.pickup_date}</span>
                    <span>Delivery: {load.delivery_date}</span>
                    {load.weight && <span>{load.weight.toLocaleString()} lbs</span>}
                    {load.equipment_type && (
                      <span className="capitalize">{load.equipment_type.replace("_", " ")}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-brand-navy">
                    ${load.rate_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-steel">
                    {load.rate_type === "per_mile" ? "per mile" : "flat rate"}
                  </p>
                  <button
                    onClick={() => setConfirmingLoad(load)}
                    className="btn-primary mt-2 text-sm"
                  >
                    Book Load
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Tab
// ---------------------------------------------------------------------------

function StatsTab({
  activeContracts,
  completedContracts,
  totalEarnings,
  contracts,
}: {
  activeContracts: number;
  completedContracts: number;
  totalEarnings: number;
  contracts: Contract[];
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-navy">My Stats</h2>
      <p className="mt-1 text-sm text-steel">Your performance and earnings overview.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm font-medium text-steel">Active Contracts</p>
          <p className="mt-1 text-3xl font-bold text-brand-navy">{activeContracts}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-steel">Completed Loads</p>
          <p className="mt-1 text-3xl font-bold text-success-green">{completedContracts}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-steel">Total Earnings</p>
          <p className="mt-1 text-3xl font-bold text-brand-amber">${totalEarnings.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-steel">Total Contracts</p>
          <p className="mt-1 text-3xl font-bold text-brand-navy">{contracts.length}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// My Loads Tab
// ---------------------------------------------------------------------------

function MyLoadsTab({ contracts }: { contracts: Contract[] }) {
  const statusColors: Record<string, string> = {
    pending: "badge-info",
    active: "badge-success",
    completed: "badge-success",
    cancelled: "badge-alert",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand-navy">My Loads</h2>
          <p className="mt-1 text-sm text-steel">Active, pending, and completed loads.</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-steel">You haven't booked any loads yet.</p>
          <p className="mt-2 text-sm text-steel">Browse the load board to find your first load.</p>
          <button
            onClick={() => window.location.href = "/dashboard/trucker?tab=board"}
            className="btn-primary mt-4"
          >
            Browse Loads
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {contracts.map((c) => (
            <div key={c.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={statusColors[c.status] || "badge-info"}>
                      {c.status}
                    </span>
                    <span className="text-sm text-steel">Contract #{c.id.slice(0, 8)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-steel">
                    <span>Rate: ${c.rate_amount.toLocaleString()}</span>
                    <span>Your payout: ${(c.rate_amount * (1 - c.commission_percent / 100)).toLocaleString()}</span>
                    <span>Commission: {c.commission_percent}%</span>
                  </div>
                  {c.tracking_info && (
                    <p className="mt-1 text-xs text-steel">Tracking: {c.tracking_info}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}