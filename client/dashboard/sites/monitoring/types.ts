export type PeriodData = {
	timestamp: number;
	dimension: { [ key: string ]: number };
};

export type TimeRange = {
	start: number;
	end: number;
};
