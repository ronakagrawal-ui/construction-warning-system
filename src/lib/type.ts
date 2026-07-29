export type Summary = {
  summary: string;
  topRisk: string;
  recommendations: string[];
};

export type SummaryResult =
| { ok: true; data: Summary }
| { ok: false; error: string};