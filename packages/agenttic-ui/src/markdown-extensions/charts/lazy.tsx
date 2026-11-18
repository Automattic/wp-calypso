import { __ } from '@wordpress/i18n';
import { lazy, Suspense } from 'react';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import type { BarChartProps } from './BarChart';
import type { ChartBlockProps } from './ChartBlock';
import type { LineChartProps } from './LineChart';
import type { ComponentType, FC } from 'react';

type Charts = typeof import( './chart-components' );

const RETRY_DELAY_MS = 500;

// The charts and @automattic/charts load the first time one renders, so pages that never show
// a chart don't download them. `lazy()` caches a rejected import, so a failed load retries once,
// after a pause (a CDN edge may not have a freshly deployed chunk yet), and then shows the
// chart's error until the page reloads. Only a bundler's chunk loader fetches again on the retry:
// a browser's own `import()` keeps the failure for the page.
const importCharts = () => import( './chart-components' );
const loadCharts = () =>
	importCharts()
		.catch( () =>
			new Promise( ( resolve ) => setTimeout( resolve, RETRY_DELAY_MS ) ).then( importCharts )
		)
		.catch( ( error ) => {
			// The chart shows a message people can act on; the cause stays in the console.
			// eslint-disable-next-line no-console
			console.error( 'Charts failed to load:', error );
			throw new Error(
				__( 'This chart couldn’t load. Reload the page to try again.', 'a8c-agenttic' )
			);
		} );

function lazyChart< P extends object >( pick: ( charts: Charts ) => ComponentType< P > ): FC< P > {
	const Lazy = lazy( () => loadCharts().then( ( charts ) => ( { default: pick( charts ) } ) ) );

	return function LazyChart( props: P ) {
		return (
			<ChartErrorBoundary>
				<Suspense fallback={ null }>
					<Lazy { ...props } />
				</Suspense>
			</ChartErrorBoundary>
		);
	};
}

export const BarChart = lazyChart< BarChartProps >( ( charts ) => charts.BarChart );
export const ChartBlock = lazyChart< ChartBlockProps >( ( charts ) => charts.ChartBlock );
export const LineChart = lazyChart< LineChartProps >( ( charts ) => charts.LineChart );
