import {
	BasicMetrics,
	BasicMetricsList,
	BasicMetricsScored,
	Metrics,
	PerformanceCategories,
	PerformanceReport,
	Scores,
} from './types';

export const BASIC_METRICS_SCORES: Record< string, [ number, number ] > = {
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
		return 'good';
	}
	if ( value > poor ) {
		return 'poor';
	}
	return 'needs-improvement';
}

/**
 * Get the overall score of the site based on the advanced performance
 * report. If the performance is greater than 0.9, the score is good,
 * @param metrics A record of metrics with their scores
 * @returns The overall score of the site
 */
function getOveralScore( metrics?: PerformanceReport ): Scores {
	if ( ! metrics ) {
		return 'good';
	}

	return metrics.performance >= 0.9 ? 'good' : 'poor';
}

/**
 * Helper method that returns if the Score is good or false otherwise
 * @param score The score to check
 * @returns True if the score is good, false otherwise
 */
function isScoreGood( score: Scores ): boolean {
	return score === 'good';
}

export function getPerformanceCategory( metrics?: PerformanceReport ): PerformanceCategories {
	const overallScore = getOveralScore( metrics );
	if ( isScoreGood( overallScore ) && metrics?.is_wpcom ) {
		return 'wpcom-high-performer';
	}
	if ( isScoreGood( overallScore ) && ! metrics?.is_wpcom ) {
		return 'non-wpcom-high-performer';
	}
	if ( ! isScoreGood( overallScore ) && metrics?.is_wpcom ) {
		return 'wpcom-low-performer';
	}
	return 'non-wpcom-low-performer';
}

export function getBasicMetricsScored( metrics: BasicMetrics ) {
	return ( Object.entries( metrics ) as BasicMetricsList ).reduce( ( acc, [ key, value ] ) => {
		acc[ key ] = { value: value, score: getScore( key as Metrics, value ) };
		return acc;
	}, {} as BasicMetricsScored );
}

export function getBasicMetricsFromPerfReport( metrics?: any ): BasicMetricsScored | undefined {
	if ( ! metrics ) {
		return undefined;
	}

	const basicMetrics = {
		cls: metrics.cls,
		fid: metrics.fid,
		lcp: metrics.lcp,
		fcp: metrics.fcp,
		ttfb: metrics.ttfb,
		inp: metrics.inp,
	};
	return getBasicMetricsScored( basicMetrics );
}
