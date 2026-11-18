import { lazy, Suspense } from 'react';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import type { BarChartProps } from './BarChart';
import type { ChartBlockProps } from './ChartBlock';
import type { LineChartProps } from './LineChart';
import type { FC } from 'react';

const RETRY_DELAY_MS = 500;

// The charts and @automattic/charts load the first time one renders, so pages that never show
// a chart don't download them. `lazy()` caches a rejected import, so a failed load retries once,
// after a pause (a CDN edge may not have a freshly deployed chunk yet), and then shows the
// chart's error until the page reloads.
const importCharts = () => import( './chart-components' );
const loadCharts = () =>
	importCharts().catch( () =>
		new Promise( ( resolve ) => setTimeout( resolve, RETRY_DELAY_MS ) ).then( importCharts )
	);

const LazyBarChart = lazy( () =>
	loadCharts().then( ( charts ) => ( { default: charts.BarChart } ) )
);
const LazyChartBlock = lazy( () =>
	loadCharts().then( ( charts ) => ( { default: charts.ChartBlock } ) )
);
const LazyLineChart = lazy( () =>
	loadCharts().then( ( charts ) => ( { default: charts.LineChart } ) )
);

export const BarChart: FC< BarChartProps > = ( props ) => (
	<ChartErrorBoundary>
		<Suspense fallback={ null }>
			<LazyBarChart { ...props } />
		</Suspense>
	</ChartErrorBoundary>
);

export const ChartBlock: FC< ChartBlockProps > = ( props ) => (
	<ChartErrorBoundary chartData={ props.data }>
		<Suspense fallback={ null }>
			<LazyChartBlock { ...props } />
		</Suspense>
	</ChartErrorBoundary>
);

export const LineChart: FC< LineChartProps > = ( props ) => (
	<ChartErrorBoundary>
		<Suspense fallback={ null }>
			<LazyLineChart { ...props } />
		</Suspense>
	</ChartErrorBoundary>
);
