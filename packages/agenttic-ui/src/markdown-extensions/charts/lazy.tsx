import { lazy, Suspense } from 'react';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import type { BarChartProps } from './BarChart';
import type { ChartBlockProps } from './ChartBlock';
import type { LineChartProps } from './LineChart';
import type { FC } from 'react';

// The charts and @automattic/charts load the first time one renders, so pages that never show
// a chart don't download them. A failed load shows the chart's error instead of the chart.
const loadCharts = () => import( './chart-components' );

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
