import { Link, createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-light-gray bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/">
            <img
              src="/freightlink-logo.svg"
              alt="FreightLink"
              className="h-8 w-auto"
              width={130}
              height={32}
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-navy">Get started with FreightLink</h1>
            <p className="mt-2 text-brand-steel">
              Create your account — it's free and takes less than 2 minutes.
            </p>
          </div>

          <div className="mt-8">
            <SignUp
              routing="hash"
              signInUrl="/login"
              forceRedirectUrl="/dashboard/trucker"
              signUpForceRedirectUrl="/dashboard/trucker"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0",
                  headerTitle: "text-brand-navy text-lg font-semibold",
                  headerSubtitle: "text-brand-steel text-sm",
                  formFieldLabel: "text-charcoal text-sm font-medium",
                  formFieldInput: "rounded-lg border border-light-gray px-4 py-2.5 text-sm text-charcoal focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20",
                  formButtonPrimary: "rounded-lg bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy/90",
                  footerActionText: "text-sm text-steel",
                  footerActionLink: "text-sm font-medium text-brand-amber hover:text-brand-amber/80",
                  socialButtonsBlockButton: "rounded-lg border border-light-gray px-4 py-2 text-sm font-medium text-charcoal hover:bg-off-white",
                  identityPreviewText: "text-sm text-charcoal",
                  identityPreviewEditButton: "text-brand-amber text-sm",
                  dividerLine: "bg-light-gray",
                  dividerText: "text-steel text-xs",
                },
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}