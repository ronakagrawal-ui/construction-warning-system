-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "cachedSummary" TEXT,
ADD COLUMN     "summaryGeneratedAt" TIMESTAMP(3);
