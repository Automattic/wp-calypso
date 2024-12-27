import {
	XYChart,
	AnimatedLineSeries,
	AnimatedAxis,
	AnimatedGrid,
	Tooltip,
	buildChartTheme,
} from '@visx/xychart';
import clsx from 'clsx';
import { FC } from 'react';
import { useChartTheme } from '../../providers/theme/theme-provider';
import { Legend } from '../legend';
import styles from './line-chart.module.scss';
import type { BaseChartProps, DataPointDate, SeriesData } from '../shared/types';

// TODO: revisit grid and axis options - accept as props for frid lines, axis, values: x, y, all, none

interface LineChartProps extends BaseChartProps< SeriesData[] > {}

type TooltipData = {
	date: Date;
	[ key: string ]: number | Date;
};

type TooltipDatum = {
	key: string;
	value: number;
};

const renderTooltip = ( {
	tooltipData,
}: {
	tooltipData?: {
		nearestDatum?: {
			datum: TooltipData;
			key: string;
		};
		datumByKey?: { [ key: string ]: { datum: TooltipData } };
	};
} ) => {
	const nearestDatum = tooltipData?.nearestDatum?.datum;
	if ( ! nearestDatum ) return null;

	const tooltipPoints: TooltipDatum[] = Object.entries( tooltipData?.datumByKey || {} )
		.map( ( [ key, { datum } ] ) => ( {
			key,
			value: datum.value as number,
		} ) )
		.sort( ( a, b ) => b.value - a.value );

	return (
		<div className={ styles[ 'line-chart__tooltip' ] }>
			<div className={ styles[ 'line-chart__tooltip-date' ] }>
				{ nearestDatum?.date?.toLocaleDateString() }
			</div>
			{ tooltipPoints.map( ( point ) => (
				<div key={ point.key } className={ styles[ 'line-chart__tooltip-row' ] }>
					<span className={ styles[ 'line-chart__tooltip-label' ] }>{ point.key }:</span>
					<span className={ styles[ 'line-chart__tooltip-value' ] }>{ point.value }</span>
				</div>
			) ) }
		</div>
	);
};

const formatDateTick = ( value: number ) => {
	const date = new Date( value );
	return date.toLocaleDateString( undefined, {
		month: 'short',
		day: 'numeric',
	} );
};

const LineChart: FC< LineChartProps > = ( {
	data,
	width,
	height,
	margin = { top: 20, right: 20, bottom: 40, left: 40 },
	className,
	withTooltips = true,
	showLegend = false,
	legendOrientation = 'horizontal',
} ) => {
	const providerTheme = useChartTheme();

	if ( ! data?.length ) {
		return (
			<div className={ clsx( 'line-chart-empty', styles[ 'line-chart-empty' ] ) }>Empty...</div>
		);
	}

	// Create legend items from group labels, this iterates over groups rather than data points
	const legendItems = data.map( ( group, index ) => ( {
		label: group.label, // Label for each unique group
		value: '', // Empty string since we don't want to show a specific value
		color: providerTheme.colors[ index % providerTheme.colors.length ],
	} ) );

	const accessors = {
		xAccessor: ( d: DataPointDate ) => {
			return d.date ? new Date(d.date) : new Date();
		},
		yAccessor: ( d: DataPointDate ) => d?.value,
	};

	const theme = buildChartTheme( {
		backgroundColor: providerTheme.backgroundColor,
		colors: providerTheme.colors,
		gridStyles: providerTheme.gridStyles,
		tickLength: providerTheme?.tickLength || 0,
		gridColor: providerTheme?.gridColor || '',
		gridColorDark: providerTheme?.gridColorDark || '',
	} );

	return (
		<div className={ clsx( 'line-chart', styles[ 'line-chart' ], className ) }>
			<XYChart
				theme={ theme }
				width={ width }
				height={ height }
				margin={ margin }
				xScale={ { type: 'time' } }
				yScale={ { type: 'linear', nice: true } }
			>
				<AnimatedGrid columns={ false } numTicks={ 4 } />
				<AnimatedAxis orientation="bottom" numTicks={ 5 } tickFormat={ formatDateTick } />
				<AnimatedAxis orientation="left" numTicks={ 4 } />

				{ data.map( ( seriesData, index ) => (
					<AnimatedLineSeries
						key={ seriesData?.label }
						dataKey={ seriesData?.label }
						data={ seriesData.data as DataPointDate[] } // TODO: this needs fixing or a more specific type for each chart
						{ ...accessors }
						stroke={ theme.colors[ index % theme.colors.length ] }
						strokeWidth={ 2 }
					/>
				) ) }

				{ withTooltips && (
					<Tooltip
						snapTooltipToDatumX
						snapTooltipToDatumY
						showSeriesGlyphs
						renderTooltip={ renderTooltip }
					/>
				) }
			</XYChart>

			{ showLegend && (
				<Legend
					items={ legendItems }
					orientation={ legendOrientation }
					className={ styles[ 'line-chart-legend' ] }
				/>
			) }
		</div>
	);
};

export default LineChart;
