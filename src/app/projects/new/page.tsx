import { createProject } from "../actions";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const isGuest = session.user.role === "guest";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-lg text-slate-800">
        {isGuest && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You're viewing a read-only demo. Browse freely — creating is disabled in demo mode.
          </div>
        )}

        <div className="mb-8 border-b border-slate-200 pb-4">
          <Link href="/projects" className="text-sm text-slate-500 hover:text-slate-900">
            ← Projects
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Add a project</h1>
        </div>

        <form action={createProject} className="space-y-4">

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Project name
            </label>
            <input
              id="name" type="text" name="name" required
              placeholder="e.g. The Elysian"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              id="location" type="text" name="location" required
              placeholder="e.g. Jaipur"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label htmlFor="totalUnits" className="mb-1 block text-sm font-medium text-slate-700">
              Total units
            </label>
            <input
              id="totalUnits" type="number" name="totalUnits" required min={0} step={1}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label htmlFor="totalBudget" className="mb-1 block text-sm font-medium text-slate-700">
              Total budget (₹) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id="totalBudget" type="number" name="totalBudget" min={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <p className="mt-1 text-xs text-slate-500">Leave blank if the budget isn&apos;t finalised yet.</p>
          </div>

          <div>
            <label htmlFor="projectManager" className="mb-1 block text-sm font-medium text-slate-700">
              Project manager
            </label>
            <input
              id="projectManager" type="text" name="projectManager" required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isGuest}
              title={isGuest ? "Not available in demo mode" : undefined}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800"
            >
              Create project
          </button>
            <Link href="/projects" className="text-sm text-slate-500 hover:text-slate-900">
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </main>
  );
}