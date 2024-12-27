import { AxisLeft, AxisBottom } from '@visx/axis';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import clsx from 'clsx';
import { FC, useCallback, type MouseEvent } from 'react';
import { useChartTheme } from '../../providers/theme';
import { Legend } from '../legend';
import { BaseTooltip } from '../tooltip';
import styles from './bar-chart.module.scss';
import type { BaseChartProps, SeriesData } from '../shared/types';

interface BarChartProps extends BaseChartProps< SeriesData[] > {}

type BarChartTooltipData = { value: number; xLabel: string; yLabel: string; seriesIndex: number };

const BarChart: FC< BarChartProps > = ( {
	data,
	width,
	height,
	margin = { top: 20, right: 20, bottom: 40, left: 40 },
	withTooltips = false,
	showLegend = false,
	legendOrientation = 'horizontal',
	className,
} ) => {
	const theme = useChartTheme();
	const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
		useTooltip< BarChartTooltipData >();

	const handleMouseMove = useCallback(
		(
			event: MouseEvent< SVGRectElement >,
			value: number,
			xLabel: string,
			yLabel: string,
			seriesIndex: number
		) => {
			const coords = localPoint( event );
			if ( ! coords ) return;

			showTooltip( {
				tooltipData: { value, xLabel, yLabel, seriesIndex },
				tooltipLeft: coords.x,
				tooltipTop: coords.y - 10,
			} );
		},
		[ showTooltip ]
	);

	const handleMouseLeave = useCallback( () => {
		hideTooltip();
	}, [ hideTooltip ] );

	if ( ! data?.length ) {
		return <div className={ clsx( 'bar-chart-empty', styles[ 'bat-chart-empty' ] ) }>Empty...</div>;
	}

	const margins = margin;
	const xMax = width - margins.left - margins.right;
	const yMax = height - margins.top - margins.bottom;

	// Get labels for x-axis from the first series (assuming all series have same labels)
	const labels = data[ 0 ].data?.map( d => d?.label );

	// Create scales
	const xScale = scaleBand< string >( {
		range: [ 0, xMax ],
		domain: labels,
		padding: 0.2,
	} );

	const innerScale = scaleBand( {
		range: [ 0, xScale.bandwidth() ],
		domain: data.map( ( _, i ) => i.toString() ),
		padding: 0.1,
	} );

	const yScale = scaleLinear< number >( {
		range: [ yMax, 0 ],
		domain: [
			0,
			Math.max( ...data.map( series => Math.max( ...series.data.map( d => d?.value || 0 ) ) ) ),
		],
	} );

	// Create legend items from group labels, this iterates over groups rather than data points
	const legendItems = data.map( ( group, index ) => ( {
		label: group.label, // Label for each unique group
		value: '', // Empty string since we don't want to show a specific value
		color: theme.colors[ index % theme.colors.length ],
	} ) );

	return (
		<div className={ clsx( 'bar-chart', className, styles[ 'bar-chart' ] ) }>
			<svg width={ width } height={ height }>
				<Group left={ margins.left } top={ margins.top }>
					{ data.map( ( series, seriesIndex ) => (
						<Group key={ seriesIndex }>
							{ series.data.map( d => {
								const xPos = xScale( d.label );
								if ( xPos === undefined ) return null;

								const barWidth = innerScale.bandwidth();
								const barX = xPos + ( innerScale( seriesIndex.toString() ) ?? 0 );

								const handleBarMouseMove = event =>
									handleMouseMove( event, d.value, d.label, series.label, seriesIndex );

								return (
									<Bar
										key={ `bar-${ seriesIndex }-${ d.label }` }
										x={ barX }
										y={ yScale( d.value ) }
										width={ barWidth }
										height={ yMax - ( yScale( d.value ) ?? 0 ) }
										fill={ theme.colors[ seriesIndex % theme.colors.length ] }
										onMouseMove={ withTooltips ? handleBarMouseMove : undefined }
										onMouseLeave={ withTooltips ? handleMouseLeave : undefined }
									/>
								);
							} ) }
						</Group>
					) ) }
					<AxisLeft scale={ yScale } />
					<AxisBottom scale={ xScale } top={ yMax } />
				</Group>
			</svg>

			{ withTooltips && tooltipOpen && tooltipData && (
				<BaseTooltip top={ tooltipTop } left={ tooltipLeft }>
					<div>
						<div>{ tooltipData.yLabel }</div>
						<div>
							{ tooltipData.xLabel }: { tooltipData.value }
						</div>
					</div>
				</BaseTooltip>
			) }

			{ showLegend && (
				<Legend
					items={ legendItems }
					orientation={ legendOrientation }
					className={ styles[ 'bar-chart-legend' ] }
				/>
			) }
		</div>
	);
};

BarChart.displayName = 'BarChart';
export default BarChart;
