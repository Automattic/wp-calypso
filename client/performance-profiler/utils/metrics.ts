import { PerformanceMetrics, Valuation } from '../types/performance-metrics';

export const metricsNames = {
	fcp: { displayName: 'Loading speed', name: 'First Contentful Paint' },
	lcp: {
		displayName: 'Largest content load',
		name: 'Largest Contentful Paint',
	},
	cls: {
		displayName: 'Visual stability',
		name: 'Cumulative Layout Shift',
	},
	inp: { displayName: 'Interactivity', name: 'Interaction to Next Paint' },
	ttfb: { displayName: 'Server responsiveness', name: 'Time to First Byte' },
};

// bad values are only needed as a maximum value on the scales
export const metricsTresholds = {
	lcp: {
		good: 2500,
		needsImprovement: 4000,
		bad: 6000,
	},
	cls: {
		good: 0.1,
		needsImprovement: 0.25,
		bad: 0.4,
	},
	fcp: {
		good: 1800,
		needsImprovement: 3000,
		bad: 5000,
	},
	ttfb: {
		good: 800,
		needsImprovement: 1800,
		bad: 3000,
	},
	inp: {
		good: 200,
		needsImprovement: 500,
		bad: 1000,
	},
};

export const mapThresholdsToStatus = (
	metric: keyof PerformanceMetrics,
	value: number
): Valuation => {
	const { good, needsImprovement } = metricsTresholds[ metric ];

	if ( value <= good ) {
		return 'good';
	}

	if ( value <= needsImprovement ) {
		return 'needsImprovement';
	}

	return 'bad';
};

export const displayValue = ( metric: keyof PerformanceMetrics, value: number ): string => {
	if ( [ 'lcp', 'fcp', 'ttfb' ].includes( metric ) ) {
		return `${ ( value / 1000 ).toFixed( 2 ) }s`;
	}

	if ( [ 'inp', 'fid' ].includes( metric ) ) {
		return `${ value }ms`;
	}

	return `${ value }`;
};
