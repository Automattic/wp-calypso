import { LineChart } from '@automattic/charts';
// Without the package's own styles the chart collapses to zero width.
import '@automattic/charts/style.css';
import { formatNumberCompact } from '@automattic/number-formatters';
import moment from 'moment';
import { FunctionComponent } from 'react';

export interface ChartSeries {
	label: string;
	data: Array< { date: Date; value: number } >;
	options: { stroke?: string };
}

interface OverviewChartProps {
	series: ChartSeries[];
	height: number;
}

/**
 * The Overview line chart, loaded as its own chunk: `@automattic/charts` bundles visx
 * (~157KB gzipped), so the rest of the widget paints without waiting for it.
 * @param props        Component props.
 * @param props.series The series to plot.
 * @param props.height Chart height in pixels.
 */
const OverviewChart: FunctionComponent< OverviewChartProps > = ( { series, height } ) => (
	<LineChart
		data={ series }
		withTooltips
		withGradientFill
		animation
		height={ height }
		curveType="monotone"
		margin={ { left: 32, top: 8, bottom: 20, right: 8 } }
		options={ {
			// Start at zero, so ranges that never approach it don't look more dramatic
			// than they are.
			yScale: { type: 'linear', zero: true },
			axis: {
				// The class lets mini-chart.scss right-align the last date on the 7-day chart.
				x: {
					axisClassName: 'stats-widget-chart__x-axis',
					tickFormat: ( value: number ) => moment( value ).format( 'MMM D' ),
				},
				// Compact ticks ("12K"), which fit the left margin and match the totals. Zero is
				// blanked since the grid line marks it; the package doesn't type visx's `hideZero`.
				y: {
					orientation: 'left',
					tickFormat: ( value: number ) => ( value === 0 ? '' : formatNumberCompact( value ) ),
				},
			},
		} }
	/>
);

export default OverviewChart;
