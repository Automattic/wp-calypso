import { PerformanceMetricsItemQueryResponse, Metrics } from './core-web-vitals';
import { __ } from '@wordpress/i18n';

export type Valuation = 'good' | 'needsImprovement' | 'bad';

export const getMetricsNames = () => ( {
	fcp: { name: __( 'First Contentful Paint' ) },
	lcp: { name: __( 'Largest Contentful Paint' ) },
	cls: { name: __( 'Cumulative Layout Shift' ) },
	inp: { name: __( 'Interaction to Next Paint' ) },
	ttfb: { name: __( 'Time to First Byte' ) },
	tbt: { name: __( 'Total Blocking Time' ) },
	overall: { name: __( 'Performance Score' ) },
} );

export const filterRecommendations = (
	selectedFilter: string,
	audit?: PerformanceMetricsItemQueryResponse
) => {
	return (
		selectedFilter === 'all' || audit?.metricSavings?.hasOwnProperty( selectedFilter.toUpperCase() )
	);
};

export const highImpactAudits = [
	'render-blocking-resources',
	'uses-responsive-images',
	'uses-optimized-images',
	'offscreen-images',
	'server-response-time',
	'mainthread-work-breakdown',
	'largest-contentful-paint-element',
];

// bad values are only needed as a maximum value on the scales
export const metricsThresholds = {
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
	tbt: {
		good: 200,
		needsImprovement: 600,
		bad: 1000,
	},
	overall: {
		good: 100,
		needsImprovement: 89,
		bad: 49,
	},
};

export const getPerformanceStatus = ( value: number ) => {
	if ( value <= 49 ) {
		return 'bad';
	} else if ( value > 49 && value < 90 ) {
		return 'needsImprovement';
	}
	return 'good';
};

export const mapThresholdsToStatus = ( metric: Metrics, value: number ): Valuation => {
	const { good, needsImprovement } = metricsThresholds[ metric ];

	if ( metric === 'overall' ) {
		return getPerformanceStatus( value );
	}
	if ( value <= good ) {
		return 'good';
	}

	if ( value <= needsImprovement ) {
		return 'needsImprovement';
	}

	return 'bad';
};

export const max2Decimals = ( val: number ) => +Number( val ).toFixed( 2 );

export const displayValue = ( metric: Metrics, value: number ): string => {
	if ( value === null || value === undefined ) {
		return '';
	}

	if ( [ 'lcp', 'fcp', 'ttfb', 'inp', 'fid', 'tbt' ].includes( metric ) ) {
		return `${ max2Decimals( value / 1000 ) }s`;
	}

	return `${ max2Decimals( value ) }`;
};

export const getMetricValuations = ( translate: ( text: string ) => string ) => ( {
	fcp: {
		good: __( 'Your site‘s First Contentful Paint is excellent' ),
		needsImprovement: __( 'Your site‘s First Contentful Paint needs improvement' ),
		bad: __( 'Your site‘s First Contentful Paint is poor' ),
		heading: __( 'What is First Contentful Paint?' ),
		aka: __( '(FCP)' ),
		explanation: __(
			'First Contentful Paint reflects the time it takes to display the first text or image to visitors. The best sites load in under 1.8 seconds.'
		),
		docsUrl:
			'https://developer.wordpress.com/docs/site-performance/speed-test/#first-contentful-paint-fcp-',
	},
	lcp: {
		good: __( 'Your site‘s Largest Contentful Paint is excellent' ),
		needsImprovement: __( 'Your site‘s Largest Contentful Paint needs improvement' ),
		bad: __( 'Your site‘s Largest Contentful Paint is poor' ),
		heading: __( 'What is Largest Contentful Paint?' ),
		aka: __( '(LCP)' ),
		explanation: __(
			'Largest Contentful Paint measures the time it takes for the largest visible element (like an image or text block) on a page to load. The best sites load in under 2.5 seconds.'
		),
		docsUrl:
			'https://developer.wordpress.com/docs/site-performance/speed-test/#largest-contentful-paint-lcp-',
	},
	cls: {
		good: __( 'Your site‘s Cumulative Layout Shift is excellent' ),
		needsImprovement: __( 'Your site‘s Cumulative Layout Shift needs improvement' ),
		bad: __( 'Your site‘s Cumulative Layout Shift is poor' ),
		heading: __( 'What is Cumulative Layout Shift?' ),
		aka: __( '(CLS)' ),
		explanation: __(
			'Cumulative Layout Shift is assessed by measuring how often content moves unexpectedly during loading. The best sites have a score of 0.1 or lower.'
		),
		docsUrl:
			'https://developer.wordpress.com/docs/site-performance/speed-test/#cumulative-layout-shift-cls-',
	},
	inp: {
		good: __( 'Your site‘s Interaction to Next Paint is excellent' ),
		needsImprovement: __( 'Your site‘s Interaction to Next Paint needs improvement' ),
		bad: __( 'Your site‘s Interaction to Next Paint is poor' ),
		heading: __( 'What is Interaction to Next Paint?' ),
		aka: __( '(INP)' ),
		explanation: __(
			'Interaction to Next Paint measures the overall responsiveness of a webpage by evaluating how quickly it reacts to user interactions. A good score is 200 milliseconds or less, indicating that the page responds swiftly to user inputs.'
		),
		docsUrl:
			'https://developer.wordpress.com/docs/site-performance/speed-test/#interaction-to-next-paint-inp-',
	},
	ttfb: {
		good: __( 'Your site‘s Time to First Byte is excellent' ),
		needsImprovement: __( 'Your site‘s Time to First Byte needs improvement' ),
		bad: __( 'Your site‘s Time to First Byte is poor' ),
		heading: __( 'What is Time to First Byte?' ),
		aka: __( '(TTFB)' ),
		explanation: __(
			'Time to First Byte reflects the time taken for a user‘s browser to receive the first byte of data from the server after making a request. The best sites load around 800 milliseconds or less.'
		),
		docsUrl:
			'https://developer.wordpress.com/docs/site-performance/speed-test/#time-to-first-byte-ttfb-',
	},
	tbt: {
		good: __( 'Your site‘s Total Blocking Time is excellent' ),
		needsImprovement: __( 'Your site‘s Total Blocking Time needs improvement' ),
		bad: __( 'Your site‘s Total Blocking Time is poor' ),
		heading: __( 'What is Total Blocking Time?' ),
		aka: __( '(TBT)' ),
		explanation: __(
			'Total Blocking Time measures the total amount of time that a page is blocked from responding to user input, such as mouse clicks, screen taps, or keyboard presses. The best sites have a wait time of less than 200 milliseconds.'
		),
		docsUrl:
			'https://developer.wordpress.com/docs/site-performance/speed-test/#total-blocking-time-tbt-',
	},
	overall: {
		good: __( 'Your site‘s Performance Score is excellent' ),
		needsImprovement: __( 'Your site‘s Performance Score needs improvement' ),
		bad: __( 'Your site‘s Performance Score is poor' ),
		heading: __( 'What is Performance Score?' ),
		aka: __( '(PS)' ),
		explanation: __(
			'The performance score is a combined representation of your site‘s individual speed metrics.'
		),
		docsUrl: 'https://developer.wordpress.com/docs/site-performance/speed-test/#performance-score',
	},
} );
