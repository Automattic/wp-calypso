import * as Charts from '@automattic/charts';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { assertUniqueSeries, formatDate, getChartTable, getPageLocale } from '../utils/chart-data';
import { CHART_HEIGHT, ChartFigure, ZERO_BASED_SCALE } from './chart-figure';
import { getSeriesTooltipRenderer } from './chart-tooltip';
import type { Series } from '../utils/chart-data';

const getDateKey = ( { date }: { date: Date } ) => formatDate( date );

const byDate = ( a: { date: Date }, b: { date: Date } ) => a.date.getTime() - b.date.getTime();

// Like the library's own ticks: days, or years once the data spans two years.
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function getDateTickFormat( dates: Date[] ) {
	const times = dates.map( ( date ) => date.getTime() );
	const format: Intl.DateTimeFormatOptions =
		Math.max( ...times ) - Math.min( ...times ) >= TWO_YEARS_MS
			? { year: 'numeric' }
			: { month: 'short', day: 'numeric' };

	return ( value: unknown ) =>
		new Date( value as number ).toLocaleDateString( getPageLocale(), format );
}

interface LineChartProps {
	title: string;
	series: Series< { date: string; value: number } >[];
}

export function LineChart( { title, series }: LineChartProps ) {
	// Sorted by date, as the library draws them, so the table and tooltips match.
	const chartSeries = useMemo( () => {
		assertUniqueSeries( series, ( { date } ) => date );

		return series.map( ( { label, data: points } ) => ( {
			label,
			data: points
				.map( ( { date, value } ) => {
					const parsed = Charts.parseAsLocalDate( date );

					// The schema's pattern still allows a date such as 2026-02-30.
					if ( isNaN( parsed.getTime() ) ) {
						throw new Error( `A chart has an invalid date: ${ date }.` );
					}

					return { date: parsed, value };
				} )
				.sort( byDate ),
		} ) );
	}, [ series ] );

	const table = useMemo(
		() => getChartTable( __( 'Date', 'default' ), chartSeries, getDateKey, byDate ),
		[ chartSeries ]
	);
	const renderTooltip = useMemo(
		() => getSeriesTooltipRenderer( chartSeries, getDateKey ),
		[ chartSeries ]
	);

	const options = useMemo(
		() => ( {
			yScale: ZERO_BASED_SCALE,
			axis: {
				x: {
					tickFormat: getDateTickFormat(
						chartSeries.flatMap( ( { data: points } ) => points.map( ( { date } ) => date ) )
					),
				},
			},
		} ),
		[ chartSeries ]
	);

	return (
		<ChartFigure title={ title } table={ table }>
			<Charts.LineChart
				data={ chartSeries }
				height={ CHART_HEIGHT }
				options={ options }
				renderTooltip={ renderTooltip }
				showLegend={ series.length > 1 }
				withGradientFill={ false }
			/>
		</ChartFigure>
	);
}
