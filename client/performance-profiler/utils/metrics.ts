import { translate } from 'i18n-calypso';
import { Metrics } from 'calypso/data/site-profiler/types';
import { Valuation } from '../types/performance-metrics';

export const metricsNames = {
	fcp: { displayName: translate( 'Loading speed' ), name: translate( 'First Contentful Paint' ) },
	lcp: {
		displayName: translate( 'Largest content load' ),
		name: translate( 'Largest Contentful Paint' ),
	},
	cls: {
		displayName: translate( 'Visual stability' ),
		name: translate( 'Cumulative Layout Shift' ),
	},
	inp: {
		displayName: translate( 'Interactivity' ),
		name: translate( 'Interaction to Next Paint' ),
	},
	ttfb: {
		displayName: translate( 'Server responsiveness' ),
		name: translate( 'Time to First Byte' ),
	},
};

export const metricValuations = {
	fcp: {
		good: translate( "Your site's loading speed is good" ),
		needsImprovement: translate( "Your site's loading speed is moderate" ),
		bad: translate( "Your site's loading speed needs improvement" ),
		heading: translate( 'What is loading speed?' ),
		aka: translate( '(aka First Contentful Paint)' ),
		explanation: translate(
			'Loading speed reflects the time it takes to display the first text or image to visitors. The best sites load in under 1.8 seconds.'
		),
	},
	lcp: {
		good: translate( "Your site's largest content load is good" ),
		needsImprovement: translate( "Your site's largest content load is moderate" ),
		bad: translate( "Your site's largest content load needs improvement" ),
		heading: translate( 'What is largest content load?' ),
		aka: translate( '(aka Largest Contentful Paint)' ),
		explanation: translate(
			'Largest content load measures the time it takes for the largest visible element (like an image or text block) on a page to load. The best sites load in under 2.5 seconds.'
		),
	},
	cls: {
		good: translate( "Your site's visual stability is good" ),
		needsImprovement: translate( "Your site's visual stability is moderate" ),
		bad: translate( "Your site's visual stability needs improvement" ),
		heading: translate( 'What is visual stability needs?' ),
		aka: translate( '(aka Content Layout Shift)' ),
		explanation: translate(
			'Visual stability is assessed by measuring how often content moves unexpectedly during loading. The best sites have a score of 0.1 or lower.'
		),
	},
	inp: {
		good: translate( "Your site's interactivity is good" ),
		needsImprovement: translate( "Your site's interactivity is moderate" ),
		bad: translate( "Your site's interactivity needs improvement" ),
		heading: translate( 'What is interactivity?' ),
		aka: translate( '(aka Interaction to Next Paint)' ),
		explanation: translate(
			'Interactivity measures the overall responsiveness of a webpage by evaluating how quickly it reacts to user interactions. A good score is 200 milliseconds or less, indicating that the page responds swiftly to user inputs.'
		),
	},
	ttfb: {
		good: translate( "Your site's server responsiveness is good" ),
		needsImprovement: translate( "Your site's server responsiveness is moderate" ),
		bad: translate( "Your site's server responsiveness needs improvement" ),
		heading: translate( 'What is server responsiveness?' ),
		aka: translate( '(aka Time To First Byte)' ),
		explanation: translate(
			'Server responsiveness reflects the time taken for a user’s browser to receive the first byte of data from the server after making a request. The best sites load around 800 milliseconds or less.'
		),
	},
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

export const mapThresholdsToStatus = ( metric: Metrics, value: number ): Valuation => {
	const { good, needsImprovement } = metricsTresholds[ metric ];

	if ( value <= good ) {
		return 'good';
	}

	if ( value <= needsImprovement ) {
		return 'needsImprovement';
	}

	return 'bad';
};

export const displayValue = ( metric: Metrics, value: number ): string => {
	if ( [ 'lcp', 'fcp', 'ttfb' ].includes( metric ) ) {
		return `${ ( value / 1000 ).toFixed( 2 ) }s`;
	}

	if ( [ 'inp', 'fid' ].includes( metric ) ) {
		return `${ value }ms`;
	}

	return `${ value }`;
};
