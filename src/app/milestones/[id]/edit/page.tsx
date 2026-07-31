import { prisma } from "@/lib/prisma";
import { updateMilestoneSchedule, updateMilestoneProgress } from "@/app/projects/actions";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EditMilestonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
if (!session?.user) {
  redirect("/");
}
const isGuest = session.user.role === "guest";

  const milestone = await prisma.milestone.findUnique({
    where: { id: id },
    include: {
      contractor: true,
      project: { include: { contractors: true } },
    },
  });

  if (!milestone) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-lg text-slate-800">
          {isGuest && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You're viewing a read-only demo. Browse freely — editing is disabled in demo mode.
          </div>
          )}
          <p className="text-sm text-slate-700">Milestone not found.</p>
          <Link href="/projects" className="mt-2 inline-block text-sm text-slate-500 hover:text-slate-900">
            ← Projects
          </Link>
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";
  const startValue = milestone.plannedStartDate.toISOString().split("T")[0];
  const endValue = milestone.plannedEndDate.toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-lg text-slate-800">

        <div className="mb-6 border-b border-slate-200 pb-4">
          <Link href={`/projects/${milestone.projectId}`} className="text-sm text-slate-500 hover:text-slate-900">
            ← Back to project
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{milestone.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {milestone.contractor
              ? `${milestone.contractor.name} · ${milestone.contractor.scope} · ${milestone.contractor.phone ?? "no contact"}`
              : "No contractor assigned"}
          </p>
        </div>

        {/* SECTION 1 — Schedule (builder) */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Schedule &amp; assignment</h2>

          <form action={updateMilestoneSchedule} className="space-y-4">
            <input type="hidden" name="id" value={milestone.id} />
            <input type="hidden" name="projectId" value={milestone.projectId} />

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Milestone name</label>
              <input id="name" type="text" name="name" required defaultValue={milestone.name} className={inputClass} />
            </div>

            <div>
              <label htmlFor="contractorId" className="mb-1 block text-sm font-medium text-slate-700">
                Contractor <span className="font-normal text-slate-400">— optional</span>
              </label>
              <select id="contractorId" name="contractorId" defaultValue={milestone.contractorId ?? ""} className={inputClass}>
                <option value="">Unassigned</option>
                {milestone.project.contractors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.scope}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="plannedStartDate" className="mb-1 block text-sm font-medium text-slate-700">Planned start</label>
                <input id="plannedStartDate" type="date" name="plannedStartDate" required defaultValue={startValue} className={inputClass} />
              </div>
              <div>
                <label htmlFor="plannedEndDate" className="mb-1 block text-sm font-medium text-slate-700">Planned end</label>
                <input id="plannedEndDate" type="date" name="plannedEndDate" required defaultValue={endValue} className={inputClass} />
              </div>
            </div>

             <button
                type="submit"
                disabled={isGuest}
                title={isGuest ? "Not available in demo mode" : undefined}
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800"
              >
                Save schedule
              </button>
          </form>
        </div>

        {/* SECTION 2 — Progress (contractor) */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Report progress</h2>

          <form action={updateMilestoneProgress} className="space-y-4">
            <input type="hidden" name="id" value={milestone.id} />
            <input type="hidden" name="projectId" value={milestone.projectId} />

            <div>
              <label htmlFor="actualProgress" className="mb-1 block text-sm font-medium text-slate-700">Actual progress (%)</label>
              <input id="actualProgress" type="number" name="actualProgress" defaultValue={milestone.actualProgress} min={0} max={100} step={0.1} className={inputClass} />
              <p className="mt-1 text-xs text-slate-500">Planned progress is calculated from the dates above.</p>
            </div>

            <button
              type="submit"
              disabled={isGuest}
              title={isGuest ? "Not available in demo mode" : undefined}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800"
            >
              Save progress
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}