import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculateScheduleVariance, getRiskLevel, calculatePlannedProgress } from "@/lib/risk";
import { deleteProject } from "./actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const projects = await prisma.project.findMany({
  include: { milestones: true },
  
});
const riskStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700 ring-red-600/20",
  Medium: "bg-amber-100 text-amber-800 ring-amber-600/20",
  Low: "bg-green-100 text-green-700 ring-green-600/20",
};

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto text-slate-800">

        <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-500">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          </div>

          <Link
            href="/projects/new"
            className="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-900">No projects yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first project to start tracking milestone risk.
            </p>
            <Link
              href="/projects/new"
              className="mt-4 inline-block rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add project
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => {
  const risks = project.milestones.map((m) => {
    const planned = calculatePlannedProgress(m.plannedStartDate, m.plannedEndDate, new Date());
    return getRiskLevel(calculateScheduleVariance(planned, m.actualProgress));
  });

  const worstRisk = risks.includes("High")
    ? "High"
    : risks.includes("Medium")
    ? "Medium"
    : risks.length > 0
    ? "Low"
    : null;

  return (
    <li key={project.id} className="relative">
  <Link
    href={`/projects/${project.id}`}
    className="block rounded-lg border border-slate-200 bg-white p-4 pr-12 transition hover:border-slate-400"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-slate-900 truncate">{project.name}</p>
        <p className="mt-0.5 text-sm text-slate-500">{project.location}</p>
      </div>
      {worstRisk && (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${riskStyles[worstRisk]}`}>
          {worstRisk}
        </span>
      )}
    </div>
    <p className="mt-3 text-sm text-slate-700">
      {project.totalBudget === null ? "Budget unknown" : `₹${project.totalBudget.toLocaleString("en-IN")}`}
    </p>
  </Link>

  <form action={deleteProject} className="absolute right-2 bottom-2">
  <input type="hidden" name="id" value={project.id} />
  <button
    type="submit"
    aria-label="Delete project"
    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
  >
    Delete
  </button>
</form>
</li>
  );
})}
          </ul>
        )}

      </div>
    </main>
  );
}