import useResize from '@automattic/components/src/chart-uplot/hooks/use-resize';
import { Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { numberFormat } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import { TimeRange } from '../site-monitoring';
import { TIME_RANGE_OPTIONS } from '../time-range-picker';

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 1224,
};

interface UplotChartProps {
	title?: string;
	subtitle: string;
	tooltip?: string | React.ReactNode;
	className?: string;
	data: uPlot.AlignedData;
	fillColor?: string;
	options?: Partial< uPlot.Options >;
	legendContainer?: React.RefObject< HTMLDivElement >;
	solidFill?: boolean;
	period?: string;
	series: Array< SeriesProp >;
	timeRange: TimeRange;
	isLoading?: boolean;
}

interface SeriesProp {
	fill: string;
	label: string;
	stroke: string;
	scale?: string;
	unit?: string;
	showInLegend?: boolean;
}

export function formatChartHour( date: Date ): string {
	const hours = String( date.getHours() ).padStart( 2, '0' );
	const minutes = String( date.getMinutes() ).padStart( 2, '0' );
	return `${ hours }:${ minutes }`;
}

function formatDaysChartHour( date: Date ): string {
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	const day = String( date.getDate() ).padStart( 2, '0' );
	const hours = String( date.getHours() ).padStart( 2, '0' );
	const minutes = String( date.getMinutes() ).padStart( 2, '0' );
	return `${ hours }:${ minutes }\n ${ month }/${ day } `;
}

function determineTimeRange( timeRange: TimeRange ) {
	const { start, end } = timeRange;
	const hours = ( end - start ) / 60 / 60;
	if ( hours <= 6 ) {
		return TIME_RANGE_OPTIONS[ '6-hours' ];
	} else if ( hours <= 24 ) {
		return TIME_RANGE_OPTIONS[ '24-hours' ];
	} else if ( hours <= 3 * 24 ) {
		return TIME_RANGE_OPTIONS[ '3-days' ];
	} else if ( hours <= 7 * 24 ) {
		return TIME_RANGE_OPTIONS[ '7-days' ];
	}

	return TIME_RANGE_OPTIONS[ '24-hours' ]; // Default value
}

function createSeries( series: Array< SeriesProp > ) {
	const { spline } = uPlot.paths;
	const configuredSeries: uPlot.Series[] = series.map( function ( serie ) {
		return {
			...serie,
			...{
				width: 2,
				paths: ( u: uPlot, seriesIdx: number, idx0: number, idx1: number ) => {
					return spline?.()( u, seriesIdx, idx0, idx1 ) || null;
				},
				points: {
					show: false,
				},
				value: ( self: uPlot, rawValue: number ) => {
					if ( ! rawValue ) {
						return '-';
					}

					return numberFormat( rawValue, 0 );
				},
			},
		};
	} );

	return [ { label: ' ' }, ...configuredSeries ];
}

function addExtraScaleIfDefined( series: Array< SeriesProp > ) {
	const serie = series.find( ( serie ) => serie.scale );

	if ( serie?.scale ) {
		return [
			{
				scale: serie.scale,
				side: 1,
				size: 60,
				grid: {
					show: false,
				},
				stroke: '#787C82',
				ticks: {
					show: false,
				},
				values: ( u: uPlot, ticks: number[] ) =>
					ticks.map( ( rawValue ) => {
						return rawValue + ( serie?.unit ? ' ' + serie.unit : '' );
					} ),
			},
		];
	}
	return [];
}

export const SiteMonitoringLineChart = ( {
	title,
	subtitle,
	className,
	data,
	legendContainer,
	options: propOptions,
	series,
	timeRange,
	isLoading = false,
}: UplotChartProps ) => {
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef< HTMLDivElement | null >( null );
	const [ chartDimensions, setChartDimensions ] = useState( DEFAULT_DIMENSIONS );
	const localTz = new Intl.DateTimeFormat().resolvedOptions().timeZone;

	const options = useMemo( () => {
		const extraScale = addExtraScaleIfDefined( series );
		const defaultOptions: uPlot.Options = {
			class: 'calypso-uplot-chart',
			...chartDimensions,
			// Set incoming dates as UTC.
			tzDate: ( ts ) => uPlot.tzDate( new Date( ts * 1e3 ), localTz ),
			fmtDate: () => {
				return ( date ) => {
					const chatHour = formatChartHour( date );
					const dayHour = formatDaysChartHour( date );
					const timeRangeResult = determineTimeRange( timeRange );

					if (
						timeRangeResult === TIME_RANGE_OPTIONS[ '6-hours' ] ||
						timeRangeResult === TIME_RANGE_OPTIONS[ '24-hours' ]
					) {
						return chatHour;
					} else if (
						timeRangeResult === TIME_RANGE_OPTIONS[ '3-days' ] ||
						timeRangeResult === TIME_RANGE_OPTIONS[ '7-days' ]
					) {
						return dayHour;
					}

					return dayHour;
				};
			},
			axes: [
				{
					// x-axis
					grid: {
						show: false,
					},
					stroke: '#787C82',
					ticks: {
						stroke: '#787C82',
						width: 1,
						size: 3,
					},
				},
				{
					// y-axis
					gap: 8,
					space: 40,
					size: 40,
					stroke: '#787C82',
					grid: {
						stroke: '#DCDCDE',
						width: 1,
					},
					ticks: {
						show: false,
					},
				},
				...extraScale,
			],
			cursor: {
				x: false,
				y: false,
				points: {
					size: ( u, seriesIdx ) => ( u.series[ seriesIdx ].points?.size || 1 ) * 2,
					width: ( u, seriesIdx, size ) => size / 4,
					stroke: ( u, seriesIdx ) => {
						const stroke = u.series[ seriesIdx ]?.points?.stroke;
						return typeof stroke === 'function'
							? ( stroke( u, seriesIdx ) as CanvasRenderingContext2D[ 'strokeStyle' ] )
							: ( stroke as CanvasRenderingContext2D[ 'strokeStyle' ] );
					},
					fill: () => '#fff',
				},
				drag: {
					setScale: false,
				},
			},
			select: {
				show: false,
				width: 0,
				height: 0,
				left: 0,
				top: 0,
			},
			series: createSeries( series ),
			legend: {
				isolate: true,
				mount: ( self: uPlot, el: HTMLElement ) => {
					// If legendContainer is defined, move the legend into it.
					if ( legendContainer?.current ) {
						legendContainer?.current.append( el );
					}
				},
			},
			hooks: {
				init: [
					( uPlot ) => {
						[ ...uPlot.root.querySelectorAll< HTMLElement >( '.u-legend .u-series' ) ].forEach(
							( el, i ) => {
								const serie = uPlot.series[ i ] as SeriesProp;
								if ( ! serie.showInLegend ) {
									el.style.display = 'none';
								}
							}
						);
					},
				],
			},
		};

		return {
			...defaultOptions,
			...( typeof propOptions === 'object' ? propOptions : {} ),
		};
	}, [ chartDimensions, series, propOptions, localTz, timeRange, legendContainer ] );

	useResize( uplot, uplotContainer );

	useEffect( () => {
		if ( uplotContainer.current ) {
			const { width } = uplotContainer.current.getBoundingClientRect();
			if ( width !== chartDimensions.width ) {
				setChartDimensions( { width, height: DEFAULT_DIMENSIONS.height } );
			}
		}
	}, [ chartDimensions, data ] );

	const classes = [ 'site-monitoring-line-chart', 'site-monitoring__chart' ];
	if ( className ) {
		classes.push( className );
	}

	return (
		<HostingCard className={ clsx( classes ) } title={ title }>
			<HostingCardDescription>{ subtitle }</HostingCardDescription>
			<div ref={ uplotContainer }>
				{ isLoading && <Spinner /> }
				<UplotReact
					data={ data }
					onCreate={ ( chart ) => ( uplot.current = chart ) }
					options={ options }
				/>
			</div>
		</HostingCard>
	);
};
