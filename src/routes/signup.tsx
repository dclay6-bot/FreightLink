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
            <h1 className="text-2xl font-bold text-brand-navy">Get started with Mountain Hawk Freight</h1>
            <p className="mt-2 text-steel">
              Create your account — it's free and takes less than 2 minutes.
            </p>
          </div>

          <div className="card mt-8">
            <SignUp
              routing="hash"
              signInUrl="/login"
              forceRedirectUrl="/dashboard/trucker"
              signUpForceRedirectUrl="/dashboard/trucker"
            />
          </div>
        </div>
      </main>
    </div>
  );
}