import { Link, createFileRoute } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";

export const Route = createFileRoute("/")({
  component: Home,
});

const navigation = [
  { label: "For Truckers", href: "#truckers" },
  { label: "For Shippers", href: "#shippers" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

function Logo({ white }: { white?: boolean }) {
  const src = white ? "/mountain-hawk-logo-white.svg" : "/mountain-hawk-logo.svg";
  return (
    <img
      src={src}
      alt="Mountain Hawk Freight"
      className="h-10 w-auto"
      width={160}
      height={40}
    />
  );
}

function DashboardLink() {
  const { userId } = useAuth();
  return (
    <Link
      to="/dashboard/trucker"
      className="btn-ghost text-sm"
    >
      Dashboard
    </Link>
  );
}

function Home() {
  return (
    <>
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-light-gray/50 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-steel transition-colors hover:text-brand-navy"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SignedIn>
              <DashboardLink />
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                to="/login"
                className="btn-ghost hidden text-sm md:inline-flex"
              >
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Get Started
              </Link>
            </SignedOut>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-primary">
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(245, 158, 11, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)`,
              }}
            />
          </div>

          <div className="container-section relative flex min-h-[90dvh] flex-col items-center justify-center px-6 py-24 text-center">
            <div className="mb-8">
              <Logo white />
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Direct. Reliable.{" "}
              <span className="text-brand-amber">Connected.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
              Find your next load in seconds. No dispatcher. No middleman. Just
              owner-operators connecting directly with shippers who need
              reliable capacity.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link to="/signup" className="btn-cta text-base sm:text-lg">
                Join as a Trucker
              </Link>
              <Link
                to="/signup?type=shipper"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/80 bg-transparent px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-brand-navy"
              >
                I'm a Shipper
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/60">
              No dispatching license required. Free to join.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/dashboard/trucker?demo=true"
                className="text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/80"
              >
                Preview Trucker Dashboard →
              </Link>
              <Link
                to="/dashboard/shipper?demo=true"
                className="text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/80"
              >
                Preview Shipper Dashboard →
              </Link>
            </div>
          </div>
        </section>

        {/* Trust / Stats Section */}
        <section className="section-padding border-b border-light-gray bg-white">
          <div className="container-section">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { number: "5,000+", label: "Active Truckers" },
                { number: "12,000+", label: "Loads This Month" },
                { number: "98%", label: "On-Time Pickup Rate" },
                { number: "2.4hrs", label: "Average Match Time" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-brand-navy md:text-4xl">
                    {stat.number}
                  </p>
                  <p className="mt-1 text-sm text-steel">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Truckers Section */}
        <section
          id="truckers"
          className="section-padding bg-off-white"
        >
          <div className="container-section">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="badge-info mb-4">For Truckers</span>
                <h2 className="text-3xl font-semibold text-brand-navy sm:text-4xl">
                  Built for owner-operators.
                </h2>
                <p className="mt-4 text-lg text-steel">
                  Stop wasting hours on load boards or giving away 30% of your
                  rate to a dispatcher. Mountain Hawk Freight puts you in control — find
                  profitable loads instantly and connect directly with shippers.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    {
                      title: "No Dispatcher Fees",
                      desc: "Keep more of what you earn. Our marketplace fee is just 8-15% — far less than traditional dispatching.",
                    },
                    {
                      title: "Find Loads Instantly",
                      desc: "Real-time load board with filters by rate, distance, weight, and equipment type. Never deadhead empty again.",
                    },
                    {
                      title: "Get Paid Fast",
                      desc: "Quick pay options available. No waiting 30-60 days for brokers to cut checks.",
                    },
                    {
                      title: "Verified Shippers",
                      desc: "Every shipper is vetted. No shady brokers, no non-payment risk. Your time and money are protected.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-green/10">
                        <svg
                          className="h-3 w-3 text-success-green"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-charcoal">
                          {item.title}
                        </p>
                        <p className="text-sm text-steel">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="btn-primary mt-8">
                  Join as a Trucker
                </Link>
              </div>
              <div className="relative hidden lg:block">
                <img
                  src="/mountain-hawk-hero.jpg"
                  alt="Truck on the highway"
                  className="rounded-2xl object-cover shadow-2xl"
                  width={600}
                  height={500}
                />
              </div>
            </div>
          </div>
        </section>

        {/* For Shippers Section */}
        <section
          id="shippers"
          className="section-padding bg-white"
        >
          <div className="container-section">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-last lg:order-first relative hidden lg:block">
                <img
                  src="/mountain-hawk-hero.jpg"
                  alt="Shipping logistics"
                  className="rounded-2xl object-cover shadow-2xl"
                  width={600}
                  height={500}
                />
              </div>
              <div>
                <span className="badge-info mb-4">For Shippers & Brokers</span>
                <h2 className="text-3xl font-semibold text-brand-navy sm:text-4xl">
                  Reliable capacity when you need it.
                </h2>
                <p className="mt-4 text-lg text-steel">
                  Stop chasing carriers and worrying about coverage. Post your
                  loads once and get matched with pre-vetted owner-operators who
                  are ready to haul — on your terms.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    {
                      title: "Post Loads in Minutes",
                      desc: "Simple load posting with all the details shippers need. Set your rate, pickup/delivery windows, and equipment requirements.",
                    },
                    {
                      title: "Vetted Carrier Network",
                      desc: "Access a growing network of reliable owner-operators and small fleets. Every carrier is verified for authority and insurance.",
                    },
                    {
                      title: "Real-Time Tracking",
                      desc: "Track your shipments in real time. Know exactly when your freight will arrive — no more guessing games.",
                    },
                    {
                      title: "Competitive Rates",
                      desc: "Get the best rates by connecting directly with carriers. No brokerage markups, no hidden fees.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-info-blue/10">
                        <svg
                          className="h-3 w-3 text-info-blue"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-charcoal">
                          {item.title}
                        </p>
                        <p className="text-sm text-steel">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup?type=shipper"
                  className="btn-primary mt-8"
                >
                  Start Shipping
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section-padding bg-off-white">
          <div className="container-section text-center">
            <h2 className="text-3xl font-semibold text-brand-navy sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-steel">
              Getting started is simple. Whether you're a trucker looking for
              your next load or a shipper needing reliable capacity.
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="card text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-amber/10">
                  <span className="text-2xl font-bold text-brand-amber">1</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-navy">
                  Create Your Account
                </h3>
                <p className="mt-2 text-steel">
                  Sign up in under 2 minutes. Truckers verify your authority and
                  insurance. Shippers set up your company profile.
                </p>
              </div>

              {/* Step 2 */}
              <div className="card text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-amber/10">
                  <span className="text-2xl font-bold text-brand-amber">2</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-navy">
                  Post or Find Loads
                </h3>
                <p className="mt-2 text-steel">
                  Shippers post loads with details and rates. Truckers browse
                  available loads with powerful filters — find your perfect match
                  in seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="card text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-amber/10">
                  <span className="text-2xl font-bold text-brand-amber">3</span>
                </div>
                <h3 className="text-xl font-semibold text-brand-navy">
                  Track & Get Paid
                </h3>
                <p className="mt-2 text-steel">
                  Shipper marks your load in transit, you haul it, and both parties track in real time.
                  Get paid fast once delivered.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section-padding bg-white">
          <div className="container-section">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-brand-navy sm:text-4xl">
                Everything you need to move freight
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-steel">
                A full-featured platform designed for the modern freight
                industry.
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Smart Match",
                  desc: "Our algorithm matches your load with the best available carrier based on location, equipment, and preferences.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-brand-amber"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Real-Time Tracking",
                  desc: "GPS tracking for every shipment. Know where your freight is at all times with live updates.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-brand-amber"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Quick Payments",
                  desc: "Fast and secure payment processing. Multiple payout options including same-day and instant pay.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-brand-amber"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Document Management",
                  desc: "Upload, store, and share all your important documents — BOLs, rate confirmations, inspection reports — all in one place.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-brand-amber"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Rating & Reviews",
                  desc: "Transparent rating system for both truckers and shippers. Build your reputation and trust on the platform.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-brand-amber"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "24/7 Support",
                  desc: "Our team is available around the clock to help with any issues. We're here when you need us.",
                  icon: (
                    <svg
                      className="h-6 w-6 text-brand-amber"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                      />
                    </svg>
                  ),
                },
              ].map((feature) => (
                <div key={feature.title} className="card">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-amber/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-navy">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-steel">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-primary">
          <div className="container-section text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Ready to move?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Join thousands of truckers and shippers who are already
              connected on Mountain Hawk Freight. Sign up free — no obligations.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup" className="btn-cta text-base sm:text-lg">
                Join as a Trucker
              </Link>
              <Link
                to="/signup?type=shipper"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/80 bg-transparent px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-brand-navy"
              >
                I'm a Shipper
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-light-gray bg-brand-navy">
        <div className="container-section px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo white />
              <p className="mt-4 max-w-md text-sm text-white/60">
                The digital freight-matching platform connecting independent
                truckers directly with shippers and brokers. No dispatching
                license needed.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                For Truckers
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link
                    to="/signup"
                    className="transition-colors hover:text-white"
                  >
                    Join as Trucker
                  </Link>
                </li>
                <li>
                  <a
                    href="#truckers"
                    className="transition-colors hover:text-white"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-white"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                For Shippers
              </h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link
                    to="/signup?type=shipper"
                    className="transition-colors hover:text-white"
                  >
                    Start Shipping
                  </Link>
                </li>
                <li>
                  <a
                    href="#shippers"
                    className="transition-colors hover:text-white"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-white"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
            &copy; {new Date().getFullYear()} Mountain Hawk Freight. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}