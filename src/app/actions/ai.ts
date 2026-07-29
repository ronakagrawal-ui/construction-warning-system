"use server";
import { SummaryResult } from "@/lib/type";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {  requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function generateProjectSummary(
  projectId: string,
  riskData: any[],
  prevState: SummaryResult | null,
  formData: FormData
): Promise<SummaryResult> {
 await requireUser();
 const cached = await prisma.project.findUnique({
    where: { id: projectId },
    select: { cachedSummary: true, summaryGeneratedAt: true },
  });

  if (cached?.cachedSummary && cached.summaryGeneratedAt) {
    const ageMs = Date.now() - cached.summaryGeneratedAt.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (ageMs < twentyFourHours) {
      return { ok: true, data: JSON.parse(cached.cachedSummary) };
    }
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `You are a construction project risk analyst. Here is the risk data for each milestone of a project:

${JSON.stringify(riskData, null, 2)}

Analyse this data and respond with ONLY a valid JSON object in exactly this shape:

{
  "summary": "one short paragraph summarising overall project status",
  "topRisk": "the name of the single most at-risk milestone",
  "recommendations": ["short actionable suggestion", "another suggestion"]
}

Rules:
- Base everything strictly on the numbers provided above. Do not invent any facts, dates, or figures that are not in the data.
- "recommendations" must contain 2 to 3 items maximum.
- Return raw JSON only. No markdown code fences, no backticks, no preamble, no explanation before or after the JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);   
    if (typeof parsed.summary !== "string") {
      throw new Error("missing summary");
    }
    if (typeof parsed.topRisk !== "string") {
      throw new Error("missing topRisk");
    }
    if (!Array.isArray(parsed.recommendations)) {
      throw new Error("missing recommendations");
    }
     await prisma.project.update({
      where: { id: projectId },
      data: {
        cachedSummary: JSON.stringify(parsed),
        summaryGeneratedAt: new Date(),
      },
    });

    return { ok: true, data: parsed };   // 👈 success case

  } catch (error) {
    console.error("Summary generation failed:", error);
    return { ok: false, error: "Couldn't generate summary. Please try again." };   // 👈 failure case
  }
}