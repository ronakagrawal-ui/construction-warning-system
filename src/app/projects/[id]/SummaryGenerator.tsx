"use client";
import { SummaryResult } from "@/lib/type";
import { useActionState } from "react";

export default function SummaryGenerator({
  action,
}: {
  action: (prevState: SummaryResult | null, formData: FormData) => Promise<SummaryResult>;
}) {
  const [result, formAction, isPending] = useActionState(action, null);

  return (
  <div className="mb-8 rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Risk summary</h2>
        <p className="text-sm text-slate-500">Generated from the milestone data below.</p>
      </div>

      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Generating…" : "Generate summary"}
        </button>
      </form>
    </div>

    {result && !result.ok && (
  <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-red-600">
    {result.error}
  </p>
)}

{result && result.ok && (
  <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
    <p className="text-sm leading-relaxed text-slate-700">{result.data.summary}</p>

    <p className="text-sm text-slate-700">
      <span className="font-medium text-slate-900">Top risk:</span> {result.data.topRisk}
    </p>

    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Suggested focus areas
      </p>
      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
        {result.data.recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>
    </div>
  </div>
)}
  </div>
);
}