import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  createLoad,
  getLoadsByShipper,
  getContractsByShipper,
  getUserByClerkId,
  createUser,
  type Load,
  type Contract,
} from "~/lib/db";

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

const loadShipperStats = createServerFn({ method: "GET" }).handler(async () => {
  // No auth needed in loader — returns empty data; client populates later
  return { activeLoads: 0, pendingContracts: 0, totalLoads: 0, totalContracts: 0, loads: [], contracts: [] };
});

const loadShipperData = createServerFn({ method: "GET" }).handler(async (data: unknown) => {
  const { clerkId } = data as { clerkId: string };

  let user = getUserByClerkId(clerkId);
  if (!user) {
    user = createUser({
      email: clerkId + "@freightlink.app",
      first_name: "Shipper",
      last_name: "User",
      role: "shipper",
      clerk_id: clerkId,
    });
  }

  const loads = getLoadsByShipper(user.id);
  const contracts = getContractsByShipper(user.id);

  const activeLoads = loads.filter((l) => l.status === "available" || l.status === "assigned");
  const pendingContracts = contracts.filter((c) => c.status === "pending");
  const totalLoads = loads.length;
  const totalContracts = contracts.length;

  return { activeLoads: activeLoads.length, pendingContracts: pendingContracts.length, totalLoads, totalContracts, loads, contracts, userId: user.id };
});

const postNewLoad = createServerFn({ method: "POST" }).handler(async (data: unknown) => {
  const { clerkId, ...loadData } = data as {
    clerkId: string;
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
  };

  let user = getUserByClerkId(clerkId);
  if (!user) {
    user = createUser({
      email: clerkId + "@freightlink.app",
      first_name: "Shipper",
      last_name: "User",
      role: "shipper",
      clerk_id: clerkId,
    });
  }

  return createLoad({ ...loadData, shipper_id: user.id });
});

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/dashboard/shipper")({
  loader: () => loadShipperStats(),
  component: ShipperDashboard,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ShipperDashboard() {
  const { loads: initialLoads, contracts: initialContracts } = Route.useLoaderData();
  const { userId } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "post" | "loads" | "contracts">("overview");
  const [loads, setLoads] = useState<Load[]>(initialLoads);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [activeLoads, setActiveLoads] = useState(0);
  const [pendingContracts, setPendingContracts] = useState(0);
  const [totalLoads, setTotalLoads] = useState(0);
  const [totalContracts, setTotalContracts] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load real data when Clerk userId is available
  useEffect(() => {
    if (userId && !dataLoaded) {
      loadShipperData({ clerkId: userId }).then((data) => {
        setLoads(data.loads);
        setContracts(data.contracts);
        setActiveLoads(data.activeLoads);
        setPendingContracts(data.pendingContracts);
        setTotalLoads(data.totalLoads);
        setTotalContracts(data.totalContracts);
        setDataLoaded(true);
      });
    }
  }, [userId, dataLoaded]);

  const refreshData = () => {
    setDataLoaded(false);
  };

  return (
    <div className="min-h-dvh bg-off-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-light-gray bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src="/mountain-hawk-logo.svg" alt="Mountain Hawk Freight" className="h-8 w-auto" />
            </Link>
            <span className="hidden text-sm font-medium text-brand-amber md:inline">
              Shipper Dashboard
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
            { key: "overview" as const, label: "Overview" },
            { key: "post" as const, label: "Post a Load" },
            { key: "loads" as const, label: "My Loads" },
            { key: "contracts" as const, label: "Contracts" },
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

        {activeTab === "overview" && (
          <OverviewTab activeLoads={activeLoads} pendingContracts={pendingContracts} totalLoads={totalLoads} totalContracts={totalContracts} />
        )}
        {activeTab === "post" && (
          <PostLoadForm clerkId={userId || ""} onSuccess={() => { refreshData(); setActiveTab("loads"); }} />
        )}
        {activeTab === "loads" && (
          <MyLoadsTab loads={loads} />
        )}
        {activeTab === "contracts" && (
          <ContractsTab contracts={contracts} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OverviewTab({ activeLoads, pendingContracts, totalLoads, totalContracts }: {
  activeLoads: number;
  pendingContracts: number;
  totalLoads: number;
  totalContracts: number;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-navy">Dashboard Overview</h2>
      <p className="mt-1 text-sm text-steel">Welcome to your Mountain Hawk Freight shipper dashboard.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm font-medium text-steel">Active Loads</p>
          <p className="mt-1 text-3xl font-bold text-brand-navy">{activeLoads}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-steel">Pending Contracts</p>
          <p className="mt-1 text-3xl font-bold text-brand-amber">{pendingContracts}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-steel">Total Loads</p>
          <p className="mt-1 text-3xl font-bold text-brand-navy">{totalLoads}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-steel">Total Contracts</p>
          <p className="mt-1 text-3xl font-bold text-brand-navy">{totalContracts}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-brand-navy">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            onClick={() => window.location.href = "/dashboard/shipper?tab=post"}
            className="btn-primary"
          >
            Post a New Load
          </button>
          <button
            onClick={() => window.location.href = "/dashboard/shipper?tab=loads"}
            className="btn-secondary"
          >
            View My Loads
          </button>
        </div>
      </div>
    </div>
  );
}

function PostLoadForm({ onSuccess, clerkId }: { onSuccess: () => void; clerkId: string }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    origin_city: "",
    origin_state: "",
    dest_city: "",
    dest_state: "",
    pickup_date: "",
    delivery_date: "",
    weight: "",
    equipment_type: "",
    rate_amount: "",
    rate_type: "flat" as "flat" | "per_mile",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await postNewLoad({
        clerkId,
        title: form.title,
        description: form.description || undefined,
        origin_city: form.origin_city,
        origin_state: form.origin_state,
        dest_city: form.dest_city,
        dest_state: form.dest_state,
        pickup_date: form.pickup_date,
        delivery_date: form.delivery_date,
        weight: form.weight ? Number(form.weight) : undefined,
        equipment_type: form.equipment_type || undefined,
        rate_amount: Number(form.rate_amount),
        rate_type: form.rate_type,
      });
      onSuccess();
      setForm({
        title: "", description: "", origin_city: "", origin_state: "",
        dest_city: "", dest_state: "", pickup_date: "", delivery_date: "",
        weight: "", equipment_type: "", rate_amount: "", rate_type: "flat",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post load");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-navy">Post a New Load</h2>
      <p className="mt-1 text-sm text-steel">
        Fill in the details below to post a new freight load. Truckers will see it on the load board.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        {error && (
          <div className="rounded-lg bg-alert-red/10 p-4 text-sm text-alert-red">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-charcoal">Load Title *</label>
          <input
            type="text" required value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g., Dry Van Load - Chicago to Atlanta"
            className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Additional details about the load..."
            rows={3}
            className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal">Origin City *</label>
            <input
              type="text" required value={form.origin_city}
              onChange={(e) => update("origin_city", e.target.value)}
              placeholder="e.g., Chicago"
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Origin State *</label>
            <select
              required value={form.origin_state}
              onChange={(e) => update("origin_state", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            >
              <option value="">Select state</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal">Destination City *</label>
            <input
              type="text" required value={form.dest_city}
              onChange={(e) => update("dest_city", e.target.value)}
              placeholder="e.g., Atlanta"
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Destination State *</label>
            <select
              required value={form.dest_state}
              onChange={(e) => update("dest_state", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            >
              <option value="">Select state</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal">Pickup Date *</label>
            <input
              type="date" required value={form.pickup_date}
              onChange={(e) => update("pickup_date", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Delivery Date *</label>
            <input
              type="date" required value={form.delivery_date}
              onChange={(e) => update("delivery_date", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal">Weight (lbs)</label>
            <input
              type="number" value={form.weight}
              onChange={(e) => update("weight", e.target.value)}
              placeholder="e.g., 45000"
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Equipment Type</label>
            <select
              value={form.equipment_type}
              onChange={(e) => update("equipment_type", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            >
              <option value="">Select equipment</option>
              <option value="dry_van">Dry Van</option>
              <option value="reefer">Reefer</option>
              <option value="flatbed">Flatbed</option>
              <option value="step_deck">Step Deck</option>
              <option value="lowboy">Lowboy</option>
              <option value="tanker">Tanker</option>
              <option value="box_truck">Box Truck</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal">Rate Amount *</label>
            <input
              type="number" required value={form.rate_amount}
              onChange={(e) => update("rate_amount", e.target.value)}
              placeholder="e.g., 2500"
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Rate Type</label>
            <select
              value={form.rate_type}
              onChange={(e) => update("rate_type", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-light-gray px-4 py-2.5 text-sm focus:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/20"
            >
              <option value="flat">Flat Rate</option>
              <option value="per_mile">Per Mile</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Posting..." : "Post Load"}
          </button>
          <button type="button" onClick={() => window.location.href = "/dashboard/shipper"} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function MyLoadsTab({ loads }: { loads: Load[] }) {
  const statusColors: Record<string, string> = {
    available: "badge-success",
    assigned: "badge-info",
    in_transit: "badge-info",
    delivered: "badge-success",
    cancelled: "badge-alert",
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-navy">My Loads</h2>
      <p className="mt-1 text-sm text-steel">All loads you've posted, organized by status.</p>

      {loads.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-steel">You haven't posted any loads yet.</p>
          <button onClick={() => window.location.href = "/dashboard/shipper?tab=post"} className="btn-primary mt-4">
            Post Your First Load
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {loads.map((load) => (
            <div key={load.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-brand-navy">{load.title}</h3>
                    <span className={statusColors[load.status] || "badge-info"}>
                      {load.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-steel">
                    {load.origin_city}, {load.origin_state} → {load.dest_city}, {load.dest_state}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-steel">
                    <span>Pickup: {load.pickup_date}</span>
                    <span>Delivery: {load.delivery_date}</span>
                    {load.weight && <span>{load.weight.toLocaleString()} lbs</span>}
                    {load.equipment_type && <span>{load.equipment_type.replace("_", " ")}</span>}
                    <span className="font-medium text-brand-navy">
                      {load.rate_type === "per_mile" ? "$" : "$"}
                      {load.rate_amount.toLocaleString()}
                      {load.rate_type === "per_mile" ? "/mile" : " flat"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContractsTab({ contracts }: { contracts: Contract[] }) {
  const statusColors: Record<string, string> = {
    pending: "badge-info",
    active: "badge-success",
    completed: "badge-success",
    cancelled: "badge-alert",
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-navy">Contract Activity</h2>
      <p className="mt-1 text-sm text-steel">Track all your contracted loads and agreements.</p>

      {contracts.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-steel">No contracts yet. Contracts are created when a trucker accepts one of your loads.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {contracts.map((c) => (
            <div key={c.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={statusColors[c.status] || "badge-info"}>
                      {c.status}
                    </span>
                    <span className="text-sm text-steel">Contract #{c.id.slice(0, 8)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-steel">
                    <span>Rate: ${c.rate_amount.toLocaleString()}</span>
                    <span>Commission: {c.commission_percent}%</span>
                    <span>Trucker: {c.trucker_id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}