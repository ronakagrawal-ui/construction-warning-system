export function calculateScheduleVariance(planned: number, actual: number): number {
    return planned - actual;
}

export function getRiskLevel(Variance: number): string {
    if (Variance>=20){
        return "High";
    }
    else if (Variance>=10){
        return "Medium";
    }
    else {
        return "Low";
    }
}

export function daysBetween(start: Date, end: Date): number {
    const millisecondsDiff= end.getTime() - start.getTime();
    const days= millisecondsDiff / (1000 * 60 * 60 * 24);
    return days;
}

export function calculateDelayDays(
    plannedStart: Date,
    plannedEnd: Date,
    plannedProgress: number,
    actualProgress: number,
): number {
    const plannedDuration= daysBetween(plannedStart, plannedEnd);
    const pace= actualProgress / plannedProgress;
    const projectedDuration= plannedDuration / pace;
    const delay = projectedDuration - plannedDuration;
    return delay;
}

export function calculateCostImpact(delayDays: number, costPerDays: number): number {
    if (delayDays <= 0) {
        return 0;
    }
    return delayDays * costPerDays;
}

export function calculateCostPerDay(budget: number, days: number): number {
    if (days <= 0) {
        return 0;
    }
    return budget / days;
}

export function calculatePlannedProgress(startDate: Date, endDate: Date, today: Date): number {
    const totalDays = daysBetween(startDate, endDate);
    const daysPassed = daysBetween(startDate, today);
    
    if(totalDays === 0){
        return 100;
    }
    else if(today < startDate){
        return 0;
    }
    else if (today > endDate){
        return 100;
    }
    else {
        return (daysPassed / totalDays) * 100;
    }

}