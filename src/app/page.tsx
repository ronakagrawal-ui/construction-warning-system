import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl text-center text-slate-800">
        <h1 className="text-4xl font-semibold text-slate-900">SiteSignal</h1>
        <p className="mt-3 text-slate-600">
          Spot construction delays and cost overruns before they derail your project.
        </p>

        <Link
          href="/projects"
          className="mt-8 inline-block rounded-md bg-slate-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          View Projects
        </Link>

        {session?.user ? (
          <div className="mt-4">
            <p className="text-sm text-slate-500">
              Signed in as {session.user.name ?? session.user.email}
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="mt-2 inline-block rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
           <div className="mt-4 flex flex-col items-center gap-3">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/projects" });
              }}
            >
              <button
                type="submit"
                className="inline-block rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign in with Google
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("guest", { redirectTo: "/projects" });
              }}
            >
              <button
                type="submit"
                className="inline-block rounded-md bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                View demo (no sign-in)
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}