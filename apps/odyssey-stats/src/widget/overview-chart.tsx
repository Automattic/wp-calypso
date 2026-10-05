import { LineChart } from '@automattic/charts';
// Without the package's own styles the chart collapses to zero width.
import '@automattic/charts/style.css';
import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import moment from 'moment';
import { FunctionComponent } from 'react';
import { Unit } from '../typings';
import type { DataPointDate, RenderTooltipParams } from '@automattic/charts';

export interface ChartSeries {
	label: string;
	data: Array< { date: Date; value: number } >;
	options: { stroke?: string };
}

// The tooltip renders through @visx/tooltip's portal, which appends to `document.body` —
// outside the roots our stylesheets are scoped to — so these few rules travel with it.
const TOOLTIP_DATE_STYLE = { fontWeight: 600, marginBlockEnd: '4px' };
const TOOLTIP_ROW_STYLE = { display: 'flex', justifyContent: 'space-between', gap: '12px' };

/**
 * Tooltip for a hovered point: the date it belongs to, then each series by value.
 *
 * The package's own tooltip prints `date.toLocaleDateString()`, which labels a month's
 * total as the first day of that month and follows the browser's locale rather than the
 * site's. Moment carries Odyssey's locale, and the format follows the range's bucket, as
 * the axis labels do.
 * @param unit The range's bucket.
 * @returns The `renderTooltip` handler.
 */
function renderTooltip( unit: Unit, { tooltipData }: RenderTooltipParams< DataPointDate > ) {
	const hoveredDate = tooltipData?.nearestDatum?.datum?.date;
	if ( ! hoveredDate ) {
		return null;
	}

	const points = Object.entries( tooltipData?.datumByKey ?? {} )
		.map( ( [ label, { datum } ] ) => ( { label, value: datum.value ?? 0 } ) )
		.sort( ( a, b ) => b.value - a.value );

	return (
		<div>
			<div style={ TOOLTIP_DATE_STYLE }>
				{ moment( hoveredDate ).format( 'month' === unit ? 'MMMM YYYY' : 'MMM D, YYYY' ) }
			</div>
			{ points.map( ( point ) => (
				<div key={ point.label } style={ TOOLTIP_ROW_STYLE }>
					<span>{ point.label }</span>
					<span>{ formatNumber( point.value ) }</span>
				</div>
			) ) }
		</div>
	);
}

interface OverviewChartProps {
	series: ChartSeries[];
	height: number;
	/** The range's bucket, so monthly points are labelled by month rather than by date. */
	unit: Unit;
}

/**
 * The Overview line chart, loaded as its own chunk: `@automattic/charts` bundles visx
 * (~157KB gzipped), so the rest of the widget paints without waiting for it.
 * @param props        Component props.
 * @param props.series The series to plot.
 * @param props.height Chart height in pixels.
 * @param props.unit   The range's bucket.
 */
const OverviewChart: FunctionComponent< OverviewChartProps > = ( { series, height, unit } ) => (
	<LineChart
		data={ series }
		withTooltips
		withGradientFill
		animation
		height={ height }
		curveType="monotone"
		renderTooltip={ ( params ) => renderTooltip( unit, params ) }
		margin={ { left: 32, top: 8, bottom: 20, right: 8 } }
		options={ {
			// Start at zero, so ranges that never approach it don't look more dramatic
			// than they are.
			yScale: { type: 'linear', zero: true },
			axis: {
				// The class lets mini-chart.scss right-align the last date on the 7-day chart.
				x: {
					axisClassName: 'stats-widget-chart__x-axis',
					tickFormat: ( value: number ) =>
						moment( value ).format( 'month' === unit ? 'MMM' : 'MMM D' ),
				},
				// Compact ticks ("12K"), which fit the left margin and match the totals. Zero is
				// blanked since the grid line marks it, and so are the fractional ticks a quiet
				// site gets, since views and visitors are whole. Blanked rather than through
				// visx's `hideZero`, which the package doesn't type.
				y: {
					orientation: 'left',
					tickFormat: ( value: number ) =>
						0 === value || ! Number.isInteger( value ) ? '' : formatNumberCompact( value ),
				},
			},
		} }
	/>
);

export default OverviewChart;
