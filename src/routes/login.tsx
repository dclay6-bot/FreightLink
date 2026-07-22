import { Link, createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-light-gray bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/">
            <img
              src="/mountain-hawk-logo.svg"
              alt="Mountain Hawk Freight"
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
            <h1 className="text-2xl font-bold text-brand-navy">Welcome back</h1>
            <p className="mt-2 text-brand-steel">Sign in to your Mountain Hawk Freight account</p>
          </div>

          <div className="mt-8">
            <SignIn
              routing="hash"
              signUpUrl="/signup"
              forceRedirectUrl="/dashboard/trucker"
              signInForceRedirectUrl="/dashboard/trucker"
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