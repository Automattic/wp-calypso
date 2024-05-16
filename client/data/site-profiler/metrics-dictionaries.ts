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

export const BASIC_METRICS_SCORES: Record< Metrics, [ number, number ] > = {
	cls: [ 0.1, 0.25 ],
	fid: [ 100, 300 ],
	lcp: [ 2500, 4000 ],
	fcp: [ 1800, 3000 ],
	ttfb: [ 800, 1800 ],
	inp: [ 200, 500 ],
};

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
