export const metricsNames = {
	lcp: 'Largest Contentful Paint',
	cls: 'Cumulative Layout Shift',
	fcp: 'First Contentful Paint',
	ttfb: 'Time to First Byte',
	inp: 'Interaction to Next Paint',
};

export const metricsTresholds = {
	lcp: {
		good: 2500,
		needsImprovement: 4000,
	},
	cls: {
		good: 0.1,
		needsImprovement: 0.25,
	},
	fcp: {
		good: 1800,
		needsImprovement: 3000,
	},
	ttfb: {
		good: 800,
		needsImprovement: 1800,
	},
	inp: {
		good: 200,
		needsImprovement: 500,
	},
};
