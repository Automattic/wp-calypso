export type PerformanceMetrics = {
	cls: number;
	lcp: number;
	fcp: number;
	ttfb: number;
	inp: number;
};

export type Valuation = 'good' | 'needsImprovement' | 'bad';
