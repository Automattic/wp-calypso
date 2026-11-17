import * as Charts from '@automattic/charts';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { assertUniqueSeries, getChartTable, getLabel } from '../utils/chart-data';
import { CHART_HEIGHT, ChartFigure, ZERO_BASED_SCALE } from './chart-figure';
import { getSeriesTooltipRenderer } from './chart-tooltip';
import type { Series } from '../utils/chart-data';

// A horizontal bar chart grows with its categories, so each keeps room for its label.
const CATEGORY_ROW_HEIGHT = 24;

// The axis shortens long category names, so they don't squeeze the bars. Tooltips show them whole.
const MAX_CATEGORY_LENGTH = 20;

function shortenCategory( value: unknown ) {
	const label = String( value );

	return label.length > MAX_CATEGORY_LENGTH
		? `${ label.slice( 0, MAX_CATEGORY_LENGTH - 1 ) }…`
		: label;
}

interface BarChartProps {
	title: string;
	series: Series< { label: string; value: number } >[];
	orientation?: 'vertical' | 'horizontal';
}

export function BarChart( { title, series, orientation }: BarChartProps ) {
	const isHorizontal = orientation === 'horizontal';

	const table = useMemo( () => {
		assertUniqueSeries( series, getLabel );

		return getChartTable( __( 'Category', 'default' ), series, getLabel );
	}, [ series ] );
	const renderTooltip = useMemo( () => getSeriesTooltipRenderer( series, getLabel ), [ series ] );

	// The library draws a horizontal chart's first category at the bottom, so this reverses them.
	const chartSeries = useMemo(
		() =>
			isHorizontal
				? series.map( ( { label, data: points } ) => ( { label, data: [ ...points ].reverse() } ) )
				: series,
		[ isHorizontal, series ]
	);

	const categoryCount = table.rows.length;
	const height = isHorizontal
		? Math.max( CHART_HEIGHT, categoryCount * CATEGORY_ROW_HEIGHT )
		: CHART_HEIGHT;

	// The category axis labels every category, as the library otherwise skips some.
	const options = useMemo(
		() =>
			isHorizontal
				? {
						xScale: ZERO_BASED_SCALE,
						axis: { y: { numTicks: categoryCount, tickFormat: shortenCategory } },
					}
				: {
						yScale: ZERO_BASED_SCALE,
						axis: { x: { numTicks: categoryCount, labelOverflow: 'ellipsis' as const } },
					},
		[ isHorizontal, categoryCount ]
	);

	return (
		<ChartFigure title={ title } table={ table }>
			<Charts.BarChart
				data={ chartSeries }
				height={ height }
				options={ options }
				orientation={ orientation }
				renderTooltip={ renderTooltip }
				showLegend={ series.length > 1 }
				withTooltips
			/>
		</ChartFigure>
	);
}
