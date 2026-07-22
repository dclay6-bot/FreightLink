import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { getUserByClerkId, isUserPro, createUser } from "~/lib/db";

const STRIPE_LINK = "https://buy.stripe.com/8x2eVdaF73US3bi31D5Rm00";

const checkProStatus = createServerFn({ method: "GET" }).handler(async (data: unknown) => {
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
  return { isPro: isUserPro(user.id), userId: user.id };
});

export const Route = createFileRoute("/dashboard/pro")({
  component: ProPage,
});

function ProPage() {
  const { userId: clerkUserId, isSignedIn } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clerkUserId) {
      checkProStatus({ clerkId: clerkUserId }).then((data) => {
        setIsPro(data.isPro);
        setLoading(false);
      });
    }
  }, [clerkUserId]);

  const benefits = [
    {
      title: "Priority Load Access",
      desc: "See the best-paying loads first. Pro members get priority sorting on every load board search.",
      icon: "⭐",
    },
    {
      title: "Reduced Commission — 8%",
      desc: "Save money on every haul. Pro members pay just 8% commission instead of the standard 10%.",
      icon: "💰",
    },
    {
      title: "Faster Payouts",
      desc: "Get paid within 24 hours of delivery. No waiting for weekly or monthly payment cycles.",
      icon: "⚡",
    },
    {
      title: "Priority Support",
      desc: "24/7 priority customer support. Get help when you need it, fast.",
      icon: "🎧",
    },
  ];

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
              Pro Plan
            </span>
          </div>
          <Link to="/dashboard/trucker" className="btn-ghost text-sm">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {loading ? (
          <div className="text-center text-steel">Loading...</div>
        ) : isPro ? (
          /* Already Pro */
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-amber/10">
              <span className="text-4xl">⭐</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-navy">You're a Pro Member!</h1>
            <p className="mt-3 text-lg text-steel">
              You're enjoying all Pro benefits — priority loads, reduced 8% commission, and faster payouts.
            </p>
            <div className="card mx-auto mt-8 inline-block">
              <span className="badge-success text-base px-4 py-2">
                ✓ Pro Active
              </span>
            </div>
            <div className="mt-8">
              <Link to="/dashboard/trucker" className="btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Subscribe CTA */
          <div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-amber/10">
                <span className="text-4xl">🚀</span>
              </div>
              <h1 className="text-3xl font-bold text-brand-navy">
                Go Pro — Unlock More Loads, Lower Fees
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-steel">
                Upgrade to Mountain Hawk Freight Pro and get priority access to the best loads, reduced commission rates, and faster payouts.
              </p>
            </div>

            {/* Pricing */}
            <div className="card mx-auto mt-10 max-w-sm text-center">
              <p className="text-sm font-medium text-steel">Mountain Hawk Freight Pro</p>
              <p className="mt-2 text-5xl font-bold text-brand-navy">
                $29.<span className="text-2xl">99</span>
              </p>
              <p className="mt-1 text-sm text-steel">per month</p>
              <a
                href={STRIPE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta mt-6 w-full text-base"
              >
                Subscribe Now
              </a>
              <p className="mt-3 text-xs text-steel">
                Cancel anytime. After purchase, you'll be redirected back to your dashboard.
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-16">
              <h2 className="text-center text-2xl font-semibold text-brand-navy">
                Everything included with Pro
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {benefits.map((b) => (
                  <div key={b.title} className="card">
                    <span className="text-2xl">{b.icon}</span>
                    <h3 className="mt-3 text-lg font-semibold text-brand-navy">{b.title}</h3>
                    <p className="mt-1 text-sm text-steel">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}