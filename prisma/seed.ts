import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const project = await prisma.project.create({
    data: {
      name: "The Elysian",
      location: "Jaipur",
      type: "RESIDENTIAL",
      totalTowers: 3,
      totalUnits: 120,
      startDate: new Date("2026-01-01"),
      plannedEndDate: new Date("2028-06-30"),
      totalBudget: 500000000,
      projectManager: "Harish",
      reraNumber: "RAJ/P/2026/001234",
      reraPromisedPossession: new Date("2028-09-30"),
    },
  });
  console.log("Created project:", project.id);

  const contractor = await prisma.contractor.create({
    data: {
      projectId: project.id,
      name: "Sharma Constructions",
      scope: "Civil work",
      phone: "9876543210",
    },
  });
  console.log("Created contractor:", contractor.name);

  const foundation = await prisma.milestone.create({
    data: {
      name: "Foundation",
      projectId: project.id,
      contractorId: contractor.id,
      weightage: 15,
      plannedStartDate: new Date("2026-01-01"),
      plannedEndDate: new Date("2026-04-30"),
      actualStartDate: new Date("2026-01-05"),
      actualProgress: 100,
      isCriticalPath: true,
      status: "COMPLETED",
    },
  });
  console.log("Created milestone:", foundation.name);

  const rcc = await prisma.milestone.create({
    data: {
      name: "RCC structure",
      projectId: project.id,
      contractorId: contractor.id,
      weightage: 30,
      plannedStartDate: new Date("2026-05-01"),
      plannedEndDate: new Date("2026-11-30"),
      actualStartDate: new Date("2026-05-10"),
      actualProgress: 30,
      isCriticalPath: true,
      status: "IN_PROGRESS",
      dependsOn: { connect: { id: foundation.id } },
    },
  });
  console.log("Created milestone:", rcc.name, "(depends on Foundation)");

  // Finishing — hasn't started yet (dates in the future)
  const finishing = await prisma.milestone.create({
    data: {
      name: "Finishing & handover",
      projectId: project.id,
      weightage: 20,
      plannedStartDate: new Date("2026-12-01"),
      plannedEndDate: new Date("2027-05-31"),
      actualProgress: 0,
      status: "NOT_STARTED",
      dependsOn: { connect: { id: rcc.id } },
    },
  });
  console.log("Created milestone:", finishing.name);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });