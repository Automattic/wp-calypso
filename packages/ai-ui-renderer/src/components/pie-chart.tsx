import * as Charts from '@automattic/charts';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { assertUniqueSeries, getChartTable, getLabel } from '../utils/chart-data';
import { CHART_HEIGHT, ChartFigure } from './chart-figure';
import { ChartTooltip } from './chart-tooltip';

// The legend shows each slice's share, so the tooltip shows its value.
function renderPieTooltip( { tooltipData }: Charts.PieChartRenderTooltipParams ) {
	return <ChartTooltip heading={ tooltipData.label } rows={ [ { value: tooltipData.value } ] } />;
}

interface PieChartProps {
	title: string;
	data: { label: string; value: number }[];
}

export function PieChart( { title, data }: PieChartProps ) {
	const table = useMemo( () => {
		const series = [ { label: __( 'Value', 'default' ), data } ];

		assertUniqueSeries( series, getLabel );

		if ( ! data.some( ( { value } ) => value > 0 ) ) {
			throw new Error( 'A pie chart needs a value above 0.' );
		}

		return getChartTable( __( 'Category', 'default' ), series, getLabel );
	}, [ data ] );

	// The legend names the slices and their shares, since labels on narrow slices would overlap.
	return (
		<ChartFigure className="ai-ui-renderer__chart--pie" title={ title } table={ table }>
			<Charts.PieChart
				data={ data }
				height={ CHART_HEIGHT }
				renderTooltip={ renderPieTooltip }
				showLabels={ false }
				showLegend
				withTooltips
			/>
		</ChartFigure>
	);
}
