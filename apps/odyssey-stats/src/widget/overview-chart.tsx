import { LineChart } from '@automattic/charts';
// Without the package's own styles the chart collapses to zero width.
import '@automattic/charts/style.css';
import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import moment from 'moment';
import { FunctionComponent } from 'react';
import { Unit } from '../typings';
import type { DataPointDate, RenderTooltipParams, SeriesData } from '@automattic/charts';

// The tooltip renders through @visx/tooltip's portal, which appends to `document.body` —
// outside the roots our stylesheets are scoped to — so these few rules travel with it.
const TOOLTIP_DATE_STYLE = { fontWeight: 600, marginBlockEnd: '4px' };
const TOOLTIP_ROW_STYLE = { display: 'flex', justifyContent: 'space-between', gap: '12px' };

/**
 * Tooltip for a hovered point. The package's own prints `toLocaleDateString()`, which names
 * a month's total by its first day and ignores the site's locale.
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
	series: SeriesData[];
	height: number;
	/** The range's bucket, so monthly points are labelled by month rather than by date. */
	unit: Unit;
}

/**
 * The Overview line chart, loaded as its own chunk so the rest of the widget paints first.
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
		// Room on the right for half a date label ("Sep 30"), since the last tick can fall on
		// the last point and centre its label on the edge.
		margin={ { left: 32, top: 8, bottom: 20, right: 24 } }
		options={ {
			// From zero, so a range that never approaches it doesn't look more dramatic than it is.
			yScale: { type: 'linear', zero: true },
			axis: {
				x: {
					tickFormat: ( value: number ) =>
						moment( value ).format( 'month' === unit ? 'MMM' : 'MMM D' ),
				},
				// Compact, like the totals. Zero is left to the grid line, and a quiet site's
				// fractional ticks are blanked since views are whole (`hideZero` isn't typed).
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
