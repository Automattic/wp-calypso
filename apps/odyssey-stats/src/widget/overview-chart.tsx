import { LineChart } from '@automattic/charts';
// The package ships its layout as CSS modules; without this the chart's flex stack
// collapses to zero width and nothing renders.
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
 * The chart itself, split into its own chunk.
 *
 * `@automattic/charts` is not externalized, so it brings visx with it — around
 * 157KB gzipped, which would more than double the widget chunk that every wp-admin
 * dashboard view loads. Keeping it behind its own `import()` lets the widget shell,
 * the totals and the lists paint first, the same reason the full Stats page loads
 * its line chart through AsyncLoad.
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
			// Anchor the scale at zero. Left to itself it fits the domain to the data,
			// so a range whose values never approach zero reads as far more dramatic
			// than the numbers warrant.
			yScale: { type: 'linear', zero: true },
			axis: {
				x: { tickFormat: ( value: number ) => moment( value ).format( 'MMM D' ) },
				// Compact ticks: "12K" rather than "12,000". At the widget's width the full
				// form overflows the left margin and is clipped by the wrapper, and it
				// matches how the totals above are formatted.
				y: {
					orientation: 'left',
					tickFormat: ( value: number ) => formatNumberCompact( value ),
				},
			},
		} }
	/>
);

export default OverviewChart;
