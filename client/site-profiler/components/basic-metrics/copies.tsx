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

	const fid: CopiesProps = {
		title: translate( 'First Input Delay (FID)' ),
		nonWpcom: {
			good: {
				diagnostic: translate(
					'Your site’s FID is %(value)fms, offering quick response times. Excellent job maintaining fast interactions!',
					{ args: { value: basicMetrics?.fid?.value } }
				),
				solution: translate(
					'Migrate to WordPress.com to sustain this performance and further improve response times.'
				),
				cta: translate( 'Boost FID performance' ),
				url: migrateUrl,
			},
			poor: {
				diagnostic: translate(
					'Your site’s FID is %(value)fms, slower than most. Aim for less than 100ms for better responsiveness.',
					{
						args: {
							value: basicMetrics?.fid?.value,
						},
					}
				),
				solution: translate(
					'Migrate to WordPress.com for improved FID and faster user interactions.'
				),
				cta: translate( 'Experience Better FID' ),
				url: migrateUrl,
			},
		},
		wpcom: {
			good: {
				diagnostic: translate(
					'Your site’s FID is %(value)fms, offering quick response times. Excellent job on maintaining swift interactions!',
					{ args: { value: basicMetrics?.fid?.value } }
				),
				solution: translate(
					'Maintain this top-notch responsiveness by regularly optimizing your site for consistent performance.'
				),
				cta: translate( 'Keep layout stable' ),
				url: supportUrl,
			},
			poor: {
				diagnostic: translate(
					'Your site’s FID is %(value)fms, slower than most. Aim for less than 100ms for better responsiveness.',
					{ args: { value: basicMetrics?.fid?.value } }
				),
				solution: translate(
					'Connect with a Happiness Engineer to optimize FID and improve your site’s responsiveness'
				),
				cta: translate( 'Enhance responsiveness' ),
				url: supportUrl,
			},
		},
	};

	const fcp: CopiesProps = {
		title: translate( 'Cumulative Layout Shift (CLS)' ),
		nonWpcom: {
			good: {
				diagnostic: translate(
					'Your site’s FCP is %(value)fs, providing a fast initial load. Great job on maintaining quick content display!',
					{ args: { value: basicMetrics?.fcp?.value } }
				),
				solution: translate(
					'Migrate to WordPress.com to sustain this speed and further enhance your initial content load times.'
				),
				cta: translate( 'Improve FCP speed' ),
				url: migrateUrl,
			},
			poor: {
				diagnostic: translate(
					'Your site’s FCP is %(value)fs, slower than average. Aim for under 2s to improve user experience.',
					{
						args: {
							value: basicMetrics?.fcp?.value,
						},
					}
				),
				solution: translate(
					'Migrate to WordPress.com for tools to reduce FCP and speed up content load.'
				),
				cta: translate( 'Boost Content Load' ),
				url: migrateUrl,
			},
		},
		wpcom: {
			good: {
				diagnostic: translate(
					'Your site’s FCP is %(value)fs, providing a fast initial load. Excellent job maintaining quick content delivery!',
					{ args: { value: basicMetrics?.fcp?.value } }
				),
				solution: translate(
					'Continue optimizing your content delivery to consistently maintain this fast load time and performance.'
				),
				cta: translate( 'Maintain fast responses' ),
				url: supportUrl,
			},
			poor: {
				diagnostic: translate(
					'Your site’s FCP is %(value)fs, slower than average. Aim for under 2s to improve user experience.',
					{ args: { value: basicMetrics?.fcp?.value } }
				),
				solution: translate(
					'Connect with a Happiness Engineer to reduce FCP and speed up initial content load.'
				),
				cta: translate( 'Speed up content load' ),
				url: supportUrl,
			},
		},
	};

	const lcp: CopiesProps = {
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

	const ttfb: CopiesProps = {
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

	const inp: CopiesProps = {
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
		ttfb,
		fcp,
		lcp,
		inp,
		cls,
		fid,
	};
}
