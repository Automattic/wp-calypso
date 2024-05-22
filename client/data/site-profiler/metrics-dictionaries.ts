import { Metrics, Scores } from './types';

export const SCORES: Record< string, Scores > = {
	good: 'good',
	needsImprovement: 'needs-improvement',
	poor: 'poor',
};

export const BASIC_METRICS_UNITS: Record< Metrics, string > = {
	cls: '',
	fid: 'ms',
	lcp: 'ms',
	fcp: 'ms',
	ttfb: 'ms',
	inp: 'ms',
};

export const BASIC_METRICS_NAMES: Record< Metrics, string > = {
	cls: 'Cumulative Layout Shift',
	fid: 'First Input Delay',
	lcp: 'Largest Contentful Paint',
	fcp: 'First Contentful Paint',
	ttfb: 'Time to First Byte',
	inp: 'Interaction to Next Paint',
};

export const BASIC_METRICS_SCORES: Record< Metrics, [ number, number ] > = {
	cls: [ 0.1, 0.25 ], // https://web.dev/articles/cls
	fid: [ 100, 300 ], // https://web.dev/articles/fid
	lcp: [ 2500, 4000 ], // https://web.dev/articles/lcp
	fcp: [ 1800, 3000 ], // https://web.dev/articles/fcp
	ttfb: [ 800, 1800 ], // https://web.dev/articles/ttfb
	inp: [ 200, 500 ], // https://web.dev/articles/inp
};

/**
 * Get the score of a metric based on its value according to the Google
 * documentation that has been represented in the BASIC_METRICS_SCORES constant.
 * @param metric The metric in the Metrics type
 * @param value The value of the metric
 * @returns A score based on the value of the metric
 */
export function getScore( metric: Metrics, value: number ): Scores {
	const [ good, poor ] = BASIC_METRICS_SCORES[ metric ];
	if ( value <= good ) {
		return SCORES.good;
	}
	if ( value > poor ) {
		return SCORES.poor;
	}
	return SCORES.needsImprovement;
}
