import { UrlData } from 'calypso/blocks/import/types';
import { BasicMetricsScored, Metrics, PerformanceCategories, Scores } from './types';

export const BASIC_METRICS_UNITS: Record< Metrics, string > = {
	cls: '',
	fid: 'ms',
	lcp: 'ms',
	fcp: 'ms',
	ttfb: 'ms',
	inp: 'ms',
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
		return 'good';
	}
	if ( value > poor ) {
		return 'poor';
	}
	return 'needs-improvement';
}

/**
 * Get the overall score of the site based on the scores of the basic metrics.
 * It will return poor if more then 2 metrics are poor, good otherwise.
 * Defaults to good if no metrics are provided.
 * @param metrics A record of metrics with their scores
 * @returns The overall score of the site
 */
function getOveralScore( metrics?: BasicMetricsScored ): Scores {
	if ( ! metrics ) {
		return 'good';
	}

	const poorMetrics = Object.values( metrics ).filter( ( metric ) => metric?.score === 'poor' );
	return poorMetrics.length > 2 ? 'poor' : 'good';
}

/**
 * Helper method that returns if the Score is good or false otherwise
 * @param score The score to check
 * @returns True if the score is good, false otherwise
 */
function isScoreGood( score: Scores ): boolean {
	return score === 'good';
}

export function getPerformanceCategory(
	metrics?: BasicMetricsScored,
	urlData?: UrlData
): PerformanceCategories {
	const overallScore = getOveralScore( metrics );
	if ( isScoreGood( overallScore ) && urlData?.platform_data?.is_wpcom ) {
		return 'wpcom-high-performer';
	}
	if ( isScoreGood( overallScore ) && ! urlData?.platform_data?.is_wpcom ) {
		return 'non-wpcom-high-performer';
	}
	if ( ! isScoreGood( overallScore ) && urlData?.platform_data?.is_wpcom ) {
		return 'wpcom-low-performer';
	}
	return 'non-wpcom-low-performer';
}
