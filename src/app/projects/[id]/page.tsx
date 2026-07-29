import { prisma } from "@/lib/prisma";
import { createMilestone, deleteMilestone, createContractor } from "../actions";
import Link from "next/link";
import { calculateScheduleVariance, getRiskLevel, calculatePlannedProgress } from "@/lib/risk";
import SummaryGenerator from "./SummaryGenerator";
import { generateProjectSummary } from "@/app/actions/ai";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id: id },
    include: {
  milestones: { include: { contractor: true } },
  contractors: true,
}, 
});

  if (!project) {
  return <p>Project not found.</p>;
  }
  const riskData = project.milestones.map((milestone) => {
      const plannedProgress = calculatePlannedProgress(milestone.plannedStartDate, milestone.plannedEndDate, new Date());
  const variance = calculateScheduleVariance(plannedProgress, milestone.actualProgress);
  const risk = getRiskLevel(variance);
  return {
    name : milestone.name,
    plannedProgress,
    actualProgress: milestone.actualProgress,
    variance,
    risk,
  };
    });

    const riskStyles : Record<string, string> = {
      High: "bg-red-100 text-red-700 ring-red-600/20",
      Medium: "bg-amber-100 text-amber-800 ring-amber-600/20",
      Low: "bg-green-100 text-green-700 ring-green-600/20",
    };

  return (
    
  <main className="min-h-screen bg-slate-50 p-6">
  <div className="max-w-4xl mx-auto text-slate-800">

    <div className="mb-8 pb-4 border-b border-slate-200">
      <h1 className="text-3xl font-semibold text-slate-900">{project.name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Budget: {project.totalBudget === null ? "Unknown" : `₹${project.totalBudget.toLocaleString('en-IN')}`}
      </p>
    </div>
    <SummaryGenerator action={generateProjectSummary.bind(null, project.id, riskData)} />
    <ul className="space-y-2">
       {project.milestones.map((milestone) => {
        const plannedProgress = calculatePlannedProgress(milestone.plannedStartDate, milestone.plannedEndDate, new Date());
  const variance = calculateScheduleVariance(plannedProgress, milestone.actualProgress);
  const risk = getRiskLevel(variance);

  return (
    <li key={milestone.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
  <div className="min-w-0">
    <p className="font-medium text-slate-900 truncate">{milestone.name}</p>
    <p className="text-sm text-slate-500">
      {variance > 0
        ? `${variance.toFixed(1)}% behind schedule`
        : variance < 0
        ? `${Math.abs(variance).toFixed(1)}% ahead of schedule`
        : "On schedule"}
    </p>
    <p className="text-sm text-slate-500">
  {milestone.contractor
    ? `${milestone.contractor.name} · ${milestone.contractor.phone ?? "no contact"}`
    : "Unassigned"}
</p>
  </div>

  <div className="flex items-center gap-3 shrink-0">
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${riskStyles[risk]}`}>
      {risk}
    </span>
    <Link href={`/milestones/${milestone.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">
      Edit
    </Link>
    <form action={deleteMilestone}>
      <input type="hidden" name="id" value={milestone.id} />
      <input type="hidden" name="projectId" value={id} />
      <button type="submit" className="text-sm text-slate-400 hover:text-red-600">Delete</button>
    </form>
  </div>
</li>
  );
})}
    </ul>
    
    <div className="mt-8 pt-6 border-t border-slate-200">
  <h2 className="mb-3 text-sm font-semibold text-slate-900">Contractors</h2>

  {project.contractors.length === 0 ? (
    <p className="mb-4 text-sm text-slate-500">
      No contractors yet. Add one below to assign it to a milestone.
    </p>
  ) : (
    <ul className="mb-4 space-y-2">
      {project.contractors.map((contractor) => (
        <li
          key={contractor.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{contractor.name}</p>
            <p className="text-sm text-slate-500">{contractor.scope}</p>
          </div>
          <p className="shrink-0 text-sm text-slate-600">
            {contractor.phone ?? "No contact number"}
          </p>
          
        </li>
      ))}
    </ul>
  )}

  <form action={createContractor} className="grid gap-3 sm:grid-cols-4">
    <input type="hidden" name="projectId" value={id} />

    <div>
      <label htmlFor="contractorName" className="mb-1 block text-sm font-medium text-slate-700">
        Contractor name
      </label>
      <input
        id="contractorName" type="text" name="name" required
        placeholder="e.g. Sharma Constructions"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    </div>

    <div>
      <label htmlFor="scope" className="mb-1 block text-sm font-medium text-slate-700">
        Scope
      </label>
      <input
        id="scope" type="text" name="scope" required
        placeholder="e.g. Civil work"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    </div>

    <div>
      <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
        Contact <span className="font-normal text-slate-400">— optional</span>
      </label>
      <input
        id="phone" type="tel" name="phone"
        placeholder="98765 43210"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    </div>

    <div className="flex items-end">
      <button
        type="submit"
        className="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Add contractor
      </button>
    </div>
  </form>
</div>

    <div className="mt-8 pt-6 border-t border-slate-200">
  <h2 className="mb-3 text-sm font-semibold text-slate-900">Add a milestone</h2>

  <form action={createMilestone} className="space-y-3">
    <input type="hidden" name="projectId" value={id} />

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="sm:col-span-3">
        <label htmlFor="milestoneName" className="mb-1 block text-sm font-medium text-slate-700">
          Milestone name
        </label>
        <input
          id="milestoneName" type="text" name="name" required
          placeholder="e.g. Foundation"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
  <label htmlFor="contractorId" className="mb-1 block text-sm font-medium text-slate-700">
    Contractor <span className="font-normal text-slate-400">— optional</span>
  </label>
  <select
    id="contractorId"
    name="contractorId"
    defaultValue=""
    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
  >
    <option value="">Unassigned</option>
    {project.contractors.map((contractor) => (
      <option key={contractor.id} value={contractor.id}>
        {contractor.name} — {contractor.scope}
      </option>
    ))}
  </select>
</div>

      <div>
        <label htmlFor="plannedStartDate" className="mb-1 block text-sm font-medium text-slate-700">
          Planned start
        </label>
        <input
          id="plannedStartDate" type="date" name="plannedStartDate" required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label htmlFor="plannedEndDate" className="mb-1 block text-sm font-medium text-slate-700">
          Planned end
        </label>
        <input
          id="plannedEndDate" type="date" name="plannedEndDate" required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add milestone
        </button>
      </div>
    </div>
  </form>
</div>
    </div>

  </main>
  );
}

