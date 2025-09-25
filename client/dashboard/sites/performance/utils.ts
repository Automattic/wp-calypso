import { PerformanceMetricsItemQueryResponse } from './core-web-vitals';

export const getMetricsNames = ( translate: ( text: string ) => string ) => ( {
	fcp: { name: translate( 'First Contentful Paint' ) },
	lcp: { name: translate( 'Largest Contentful Paint' ) },
	cls: { name: translate( 'Cumulative Layout Shift' ) },
	inp: { name: translate( 'Interaction to Next Paint' ) },
	ttfb: { name: translate( 'Time to First Byte' ) },
	tbt: { name: translate( 'Total Blocking Time' ) },
	overall: { name: translate( 'Performance Score' ) },
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
