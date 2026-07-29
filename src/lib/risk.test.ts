import { calculatePlannedProgress, calculateScheduleVariance,getRiskLevel,daysBetween, calculateDelayDays, calculateCostImpact, calculateCostPerDay } from "./risk";
import { test, expect } from "vitest"; // TODO: configure Vitest globals so we don't need to import test/expect in every file

test("calculates schedule variance correctly", () => {
  const result = calculateScheduleVariance(70, 52);
  expect(result).toBe(18);
});

test("returns level of risk for variance", () => {
    expect(getRiskLevel(25)).toBe("High");
    expect(getRiskLevel(15)).toBe("Medium");
    expect(getRiskLevel(5)).toBe("Low");
});

test("calculates days between two date", () => {
    const start= new Date("2025-06-01");
    const end = new Date("2025-06-19");
    expect(daysBetween(start, end)).toBe(18);
});

test("returns zero delay when exactly on pace", () => {
    const start= new Date("2025-06-01");
    const end= new Date("2025-07-01"); //30 days
    //planned progress and actual progress equal -> pace 1.0 -> zero delay
    expect(calculateDelayDays(start, end, 50, 50)).toBe(0);
});

test("calculates the total cost impact due to delay", () => {
expect(calculateCostImpact(18, 300000)).toBe(5400000);
});

test("calculates average cost per day for the milestone", () =>
{
    expect(calculateCostPerDay(500000, 0)).toBe(0);
    expect(calculateCostPerDay(500000, 100)).toBe(5000);
});

test("returns 0 before the milestone starts", () => {
  const result = calculatePlannedProgress(
    new Date("2025-06-01"),  
    new Date("2025-08-01"),  
    new Date("2025-05-01")   
  );
  expect(result).toBe(0);
});

test("returns 100 after the milestone end", () => {
  const result = calculatePlannedProgress(
    new Date("2025-06-01"),  
    new Date("2025-08-01"),  
    new Date("2025-09-01")   
  );
  expect(result).toBe(100);
});

test("returns ~50 at the midpoint", () => {
  const result = calculatePlannedProgress(
    new Date("2025-01-01"),   
    new Date("2025-12-31"),  
    new Date("2025-07-01")   
  );
  expect(result).toBeGreaterThan(45);
  expect(result).toBeLessThan(55);
});

test("same start and end date", () => {
  const result = calculatePlannedProgress(
    new Date("2025-01-01"),   
    new Date("2025-01-01"),  
    new Date("2025-01-01")   
  );
  expect(result).toBe(100);
});