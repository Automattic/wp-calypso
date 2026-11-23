import { formatChartNumber, indexSeries } from '../utils/chart-data';
import type { Series } from '../utils/chart-data';
import type * as Charts from '@automattic/charts';

interface ChartTooltipProps {
	heading: string;
	rows: { label?: string; value: number }[];
}

export function ChartTooltip( { heading, rows }: ChartTooltipProps ) {
	return (
		<div className="ai-ui-renderer__chart-tooltip">
			<div className="ai-ui-renderer__chart-tooltip-heading">{ heading }</div>

			{ rows.map( ( { label, value } ) => (
				<div key={ label ?? heading } className="ai-ui-renderer__chart-tooltip-row">
					{ label && <span>{ label }</span> }
					<strong>{ formatChartNumber( value ) }</strong>
				</div>
			) ) }
		</div>
	);
}

// Shows each series' value at a category or date. The values come from the chart's data, as the
// library's can be stale and, from the keyboard, hold only one series.
export function getSeriesTooltipRenderer< Point extends { value: number } >(
	series: Series< Point >[],
	getKey: ( point: Point ) => string
) {
	const indexedSeries = indexSeries( series, getKey );

	return function renderTooltip( {
		tooltipData,
	}: Charts.RenderTooltipParams< Charts.DataPointDate > ) {
		const datum = tooltipData?.nearestDatum?.datum;

		if ( ! datum ) {
			return null;
		}

		const key = getKey( datum as unknown as Point );
		const rows = indexedSeries.flatMap( ( { label, points } ) => {
			const point = points.get( key );

			return point ? [ { label, value: point.value } ] : [];
		} );

		return <ChartTooltip heading={ key } rows={ rows } />;
	};
}
