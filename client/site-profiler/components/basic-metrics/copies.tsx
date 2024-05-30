import { ReactNode } from 'react';
import type { BasicMetricsScored, Metrics, Scores } from 'calypso/data/site-profiler/types';
import type { I18N } from 'i18n-calypso';

type SubsetScores = Exclude< Scores, 'needs-improvement' >;

export type MetricsCopies = {
	[ score in SubsetScores ]: {
		diagnostic: string | ReactNode;
		solution: string | ReactNode;
		cta: string | ReactNode;
		url: string;
	};
};

type WpComNonWpCom = 'wpcom' | 'nonWpcom';

type CopiesProps = {
	title: string;
} & {
	[ key in WpComNonWpCom ]: MetricsCopies;
};

type CopiesReturnValue = {
	[ k in Metrics ]: CopiesProps;
};

export type CopiesReturnValueList = [ Metrics, CopiesProps ][];

export function getCopies(
	basicMetrics: BasicMetricsScored,
	translate: I18N[ 'translate' ],
	domain: string
): CopiesReturnValue {
	const migrateUrl = `/setup/hosted-site-migration?ref=site-profiler&from=${ domain }`;
	const supportUrl = '/support';

	const cls: CopiesProps = {
		title: translate( 'Cumulative Layout Shift (CLS)' ),
		nonWpcom: {
			good: {
				diagnostic: translate(
					'Your site’s CLS is %(value)f, higher than average, causing noticeable shifts. Aim for 0.1 for smoother layout.',
					{ args: { value: basicMetrics?.cls?.value } }
				),
				solution: translate(
					'Migrate to WordPress.com for tools to reduce CLS and stabilize your layout.”'
				),
				cta: translate( 'Migrate for stability' ),
				url: migrateUrl,
			},
			poor: {
				diagnostic: translate(
					'Your site’s CLS is %(value)f, ensuring a stable layout. Excellent job maintaining low shifts!',
					{
						args: {
							value: basicMetrics?.cls?.value,
						},
					}
				),
				solution: translate(
					'Migrate to WordPress.com to maintain this stability and further enhance your site’s layout performance.'
				),
				cta: translate( 'Enhance stability' ),
				url: migrateUrl,
			},
		},
		wpcom: {
			good: {
				diagnostic: translate(
					'Your site’s CLS is %(value)f, ensuring a stable layout. Great job maintaining low shifts.',
					{ args: { value: basicMetrics?.cls?.value } }
				),
				solution: translate(
					'Keep up the good work! Continue using best practices to maintain your site’s stability.'
				),
				cta: translate( 'Explore Advanced Tips' ),
				url: supportUrl,
			},
			poor: {
				diagnostic: translate(
					'Your site’s CLS is %(value)f, higher than average, causing noticeable shifts. Aim for 0.1 for smoother layout.',
					{ args: { value: basicMetrics?.cls?.value } }
				),
				solution: translate(
					'Connect with a Happiness Engineer to reduce CLS and ensure a more stable layout for your users.'
				),
				cta: translate( 'Improve layout stability' ),
				url: supportUrl,
			},
		},
	};

	// TODO: Add the rest of the metrics
	return {
		cls,
		lcp: cls,
		fcp: cls,
		fid: cls,
		inp: cls,
		ttfb: cls,
	};
}
