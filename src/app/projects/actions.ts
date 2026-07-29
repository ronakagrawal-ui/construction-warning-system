"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireNonGuest, requireAdmin } from "@/lib/guards"

export async function createProject(formData: FormData) {
  await requireNonGuest();
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const totalUnits = parseInt(formData.get("totalUnits") as string, 10);
  if (Number.isNaN(totalUnits)){
    throw new Error("Total units must be a valid number");
  }
  const budgetRaw = formData.get("totalBudget") as string;

  let totalBudget: number | null;

  if (budgetRaw.trim() === "") {
    totalBudget = null;
  } else {
    totalBudget = parseFloat(budgetRaw);
    if (Number.isNaN(totalBudget)){
      throw new Error("Total Budget must be a valid number");
    }
  }
  const projectManager = formData.get("projectManager") as string;

  await prisma.project.create({
    data: {
      name,
      location,
      totalUnits,
      totalBudget,
      projectManager,
      startDate: new Date(),
      plannedEndDate: new Date(),
    },
  });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Not authorized: only admins can delete projects");
  }
  const id = formData.get("id") as string;

  await prisma.project.delete({
    where: { id: id},
  });

  revalidatePath("/projects");
  redirect("/projects");

}

export async function createMilestone(formData: FormData) {
  await requireNonGuest();

  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const contractorRaw = formData.get("contractorId") as string;
  const contractorId = contractorRaw === "" ? null : contractorRaw;

  const plannedStartDate = new Date(formData.get("plannedStartDate") as string);
  if (isNaN(plannedStartDate.getTime())) {
    throw new Error("Planned start date must be a valid date");
  }

  const plannedEndDate = new Date(formData.get("plannedEndDate") as string);
  if (isNaN(plannedEndDate.getTime())) {
    throw new Error("Planned end date must be a valid date");
  }

  if (plannedEndDate < plannedStartDate) {
    throw new Error("Planned end date must be on or after the planned start date");
  }

  await prisma.milestone.create({
    data: {
      projectId,
      name,
      plannedStartDate,
      plannedEndDate,
      contractorId,
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { cachedSummary: null, summaryGeneratedAt: null },
  });

  revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

  export async function deleteMilestone(formData: FormData){
    await requireNonGuest();

    const id = formData.get("id") as string;
    const projectId= formData.get("projectId") as string;

    await prisma.milestone.delete({
      where: { 
        id : id,
      }
    });
    
    await prisma.project.update({
    where: { id: projectId },
    data: { cachedSummary: null, summaryGeneratedAt: null },
  });

  revalidatePath(`/projects/${projectId}`);
      revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
  }

  export async function updateMilestoneSchedule(formData: FormData) {
    await requireNonGuest();

  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;

  const contractorRaw = formData.get("contractorId") as string;
  const contractorId = contractorRaw === "" ? null : contractorRaw;

  const plannedStartDate = new Date(formData.get("plannedStartDate") as string);
  if (isNaN(plannedStartDate.getTime())) {
    throw new Error("Planned start date must be a valid date");
  }

  const plannedEndDate = new Date(formData.get("plannedEndDate") as string);
  if (isNaN(plannedEndDate.getTime())) {
    throw new Error("Planned end date must be a valid date");
  }

  if (plannedEndDate < plannedStartDate) {
    throw new Error("Planned end date must be on or after the planned start date");
  }

  await prisma.milestone.update({
    where: { id },
    data: { name, contractorId, plannedStartDate, plannedEndDate },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { cachedSummary: null, summaryGeneratedAt: null },
  });

  revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

export async function updateMilestoneProgress(formData: FormData) {
  await requireNonGuest();

  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;

  const actualProgress = parseFloat(formData.get("actualProgress") as string);
  if (Number.isNaN(actualProgress)) {
    throw new Error("Actual progress must be a valid number");
  }
  if (actualProgress < 0 || actualProgress > 100) {
    throw new Error("Actual progress must be between 0 and 100");
  }

  await prisma.milestone.update({
    where: { id },
    data: { actualProgress },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { cachedSummary: null, summaryGeneratedAt: null },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
  
}

  export async function createContractor(formData: FormData) {
    await requireNonGuest();

    const projectId= formData.get("projectId") as string;
    const name = formData.get("name") as string;
    const scope = formData.get("scope") as string;
    const phoneRaw = formData.get("phone") as string;
  const phone = phoneRaw.trim() === "" ? null : phoneRaw.trim();

  await prisma.contractor.create({
    data:{
      projectId,
      name,
      scope,
      phone
    },
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
  }
