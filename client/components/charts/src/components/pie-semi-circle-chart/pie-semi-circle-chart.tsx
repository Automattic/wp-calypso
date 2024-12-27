import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import Pie, { PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { Text } from '@visx/text';
import { useTooltip } from '@visx/tooltip';
import clsx from 'clsx';
import { FC, useCallback } from 'react';
import { useChartTheme } from '../../providers/theme/theme-provider';
import { Legend } from '../legend';
import { BaseTooltip } from '../tooltip';
import styles from './pie-semi-circle-chart.module.scss';
import type { BaseChartProps, DataPointPercentage } from '../shared/types';

interface PieSemiCircleChartProps extends BaseChartProps< DataPointPercentage[] > {
	/**
	 * Label text to display above the chart
	 */
	label: string;
	/**
	 * Note text to display below the label
	 */
	note: string;
	/**
	 * Direction of chart rendering
	 * true for clockwise, false for counter-clockwise
	 */
	clockwise?: boolean;
	/**
	 * Thickness of the pie chart. A value between 0 and 1
	 */
	thickness?: number;
}

type ArcData = PieArcDatum< DataPointPercentage >;

const PieSemiCircleChart: FC< PieSemiCircleChartProps > = ( {
	data,
	width,
	label,
	note,
	className,
	withTooltips = false,
	clockwise = true,
	thickness = 0.4,
	showLegend,
	legendOrientation,
} ) => {
	const providerTheme = useChartTheme();
	const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
		useTooltip< DataPointPercentage >();

	const centerX = width / 2;
	const height = width / 2;
	const radius = width / 2;
	const pad = 0.03;
	const innerRadius = radius * ( 1 - thickness + pad );

	// Map the data to include index for color assignment
	const dataWithIndex = data.map( ( d, index ) => ( {
		...d,
		index,
	} ) );

	// Set the clockwise direction based on the prop
	const startAngle = clockwise ? -Math.PI / 2 : Math.PI / 2;
	const endAngle = clockwise ? Math.PI / 2 : -Math.PI / 2;

	const accessors = {
		value: ( d: DataPointPercentage & { index: number } ) => d.value,
		sort: (
			a: DataPointPercentage & { index: number },
			b: DataPointPercentage & { index: number }
		) => b.value - a.value,
		// Use the color property from the data object as a last resort. The theme provides colours by default.
		fill: ( d: DataPointPercentage & { index: number } ) =>
			d.color || providerTheme.colors[ d.index % providerTheme.colors.length ],
	};

	const handleMouseMove = useCallback(
		( event: React.MouseEvent, arc: ArcData ) => {
			const coords = localPoint( event );
			if ( ! coords ) return;

			showTooltip( {
				tooltipData: arc.data,
				tooltipLeft: coords.x,
				tooltipTop: coords.y - 10,
			} );
		},
		[ showTooltip ]
	);

	const handleMouseLeave = useCallback( () => {
		hideTooltip();
	}, [ hideTooltip ] );

	const handleArcMouseMove = useCallback(
		( arc: ArcData ) => ( event: React.MouseEvent ) => {
			handleMouseMove( event, arc );
		},
		[ handleMouseMove ]
	);

	// Create legend items
	const legendItems = data.map( ( item, index ) => ( {
		label: item.label,
		value: item.valueDisplay || item.value.toString(),
		color: accessors.fill( { ...item, index } ),
	} ) );

	return (
		<div
			className={ clsx( 'pie-semi-circle-chart', styles[ 'pie-semi-circle-chart' ], className ) }
		>
			<svg width={ width } height={ height }>
				{ /* Main chart group that contains both the pie and text elements */ }
				<Group top={ centerX } left={ centerX }>
					{ /* Pie chart */ }
					<Pie< DataPointPercentage & { index: number } >
						data={ dataWithIndex }
						pieValue={ accessors.value }
						outerRadius={ radius }
						innerRadius={ innerRadius }
						cornerRadius={ 3 }
						padAngle={ pad }
						startAngle={ startAngle }
						endAngle={ endAngle }
						pieSort={ accessors.sort }
					>
						{ pie => {
							return pie.arcs.map( arc => (
								<g
									key={ arc.data.label }
									onMouseMove={ handleArcMouseMove( arc ) }
									onMouseLeave={ handleMouseLeave }
								>
									<path d={ pie.path( arc ) || '' } fill={ accessors.fill( arc.data ) } />
								</g>
							) );
						} }
					</Pie>

					<Group>
						<Text
							textAnchor="middle"
							verticalAnchor="start"
							y={ -40 } // double font size to make room for a note
							className={ styles.label }
						>
							{ label }
						</Text>
						<Text
							textAnchor="middle"
							verticalAnchor="start"
							y={ -20 } // font size with padding
							className={ styles.note }
						>
							{ note }
						</Text>
					</Group>
				</Group>
			</svg>

			{ withTooltips && tooltipOpen && tooltipData && (
				<BaseTooltip
					data={ {
						label: tooltipData.label,
						value: tooltipData.value,
						valueDisplay: tooltipData.valueDisplay,
					} }
					top={ tooltipTop }
					left={ tooltipLeft }
				/>
			) }

			{ showLegend && (
				<Legend
					items={ legendItems }
					orientation={ legendOrientation }
					className={ styles[ 'pie-semi-circle-chart-legend' ] }
				/>
			) }
		</div>
	);
};

export default PieSemiCircleChart;
