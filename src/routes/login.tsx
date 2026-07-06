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
            <h1 className="text-2xl font-bold text-brand-navy">Welcome back</h1>
            <p className="mt-2 text-steel">Sign in to your FreightLink account</p>
          </div>

          <div className="card mt-8">
            <SignIn
              routing="hash"
              signUpUrl="/signup"
              forceRedirectUrl="/dashboard/trucker"
              signInForceRedirectUrl="/dashboard/trucker"
            />
          </div>
        </div>
      </main>
    </div>
  );
}