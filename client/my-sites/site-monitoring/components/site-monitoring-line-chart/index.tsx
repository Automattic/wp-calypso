import useResize from '@automattic/components/src/chart-uplot/hooks/use-resize';
import useScaleGradient from '@automattic/components/src/chart-uplot/hooks/use-scale-gradient';
import getGradientFill from '@automattic/components/src/chart-uplot/lib/get-gradient-fill';
import getPeriodDateFormat from '@automattic/components/src/chart-uplot/lib/get-period-date-format';
import { Spinner } from '@wordpress/components';
import classnames from 'classnames';
import { getLocaleSlug, numberFormat, useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import InfoPopover from 'calypso/components/info-popover';
import { TimeRange } from '../../metrics-tab';

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 1224,
};

interface UplotChartProps {
	title?: string;
	tooltip?: string | React.ReactNode;
	className?: string;
	data: uPlot.AlignedData;
	fillColor?: string;
	options?: Partial< uPlot.Options >;
	legendContainer?: React.RefObject< HTMLDivElement >;
	solidFill?: boolean;
	period?: string;
	timeRange: TimeRange;
	isLoading?: boolean;
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
		return '6 hours';
	} else if ( hours <= 24 ) {
		return '24 hours';
	} else if ( hours <= 3 * 24 ) {
		return '3 days';
	} else if ( hours <= 7 * 24 ) {
		return '7 days';
	}

	return '24 hours'; // Default value
}

export const SiteMonitoringLineChart = ( {
	title,
	tooltip,
	className,
	data,
	fillColor = 'rgba(48, 87, 220, 0.4)',
	legendContainer,
	options: propOptions,
	solidFill = false,
	period,
	timeRange,
	isLoading = false,
}: UplotChartProps ) => {
	const translate = useTranslate();
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef< HTMLDivElement | null >( null );
	const { spline } = uPlot.paths;
	const scaleGradient = useScaleGradient( fillColor );
	const [ chartDimensions, setChartDimensions ] = useState( DEFAULT_DIMENSIONS );

	const options = useMemo( () => {
		const defaultOptions: uPlot.Options = {
			class: 'calypso-uplot-chart',
			...chartDimensions,
			// Set incoming dates as UTC.
			tzDate: ( ts ) => uPlot.tzDate( new Date( ts * 1e3 ), 'Etc/UTC' ),
			fmtDate: () => {
				return ( date ) => {
					const chatHour = formatChartHour( date );
					const dayHour = formatDaysChartHour( date );
					const timeRangeResult = determineTimeRange( timeRange );

					if ( timeRangeResult === '6 hours' || timeRangeResult === '24 hours' ) {
						return chatHour;
					} else if ( timeRangeResult === '3 days' || timeRangeResult === '7 days' ) {
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
					ticks: {
						stroke: '#646970',
						width: 1,
						size: 3,
					},
				},
				{
					// y-axis
					side: 1, // sets y axis side to left
					gap: 8,
					space: 40,
					size: 50,
					grid: {
						stroke: 'rgba(220, 220, 222, 0.5)', // #DCDCDE with 0.5 opacity
						width: 1,
					},
					ticks: {
						show: false,
					},
				},
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
			},
			series: [
				{
					label: translate( 'Time period' ),
					value: ( self: uPlot, rawValue: number ) => {
						// outputs legend content - value available when mouse is hovering the chart
						if ( ! rawValue ) {
							return '-';
						}

						return getPeriodDateFormat(
							period,
							new Date( rawValue * 1000 ),
							getLocaleSlug() || 'en'
						);
					},
				},
				{
					fill: solidFill ? fillColor : getGradientFill( fillColor, scaleGradient ),
					label: translate( 'HTTP requests per sec' ),
					stroke: '#0675C4',
					width: 2,
					paths: ( u, seriesIdx, idx0, idx1 ) => {
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
			],
			legend: {
				isolate: true,
				mount: ( self: uPlot, el: HTMLElement ) => {
					// If legendContainer is defined, move the legend into it.
					if ( legendContainer?.current ) {
						legendContainer?.current.append( el );
					}
				},
			},
		};

		return {
			...defaultOptions,
			...( typeof propOptions === 'object' ? propOptions : {} ),
		};
	}, [
		chartDimensions,
		fillColor,
		legendContainer,
		period,
		propOptions,
		scaleGradient,
		solidFill,
		spline,
		timeRange,
		translate,
	] );

	useResize( uplot, uplotContainer );

	useEffect( () => {
		if ( uplotContainer.current ) {
			const { width, height } = uplotContainer.current.getBoundingClientRect();
			if ( width !== chartDimensions.width || height !== chartDimensions.height ) {
				setChartDimensions( { width, height } );
			}
		}
	}, [ chartDimensions, data ] );

	const classes = [ 'site-monitoring-line-chart', 'site-monitoring__chart' ];
	if ( className ) {
		classes.push( className );
	}

	return (
		<div className={ classnames( classes ) }>
			<header className="site-monitoring__chart-header">
				<h2 className="site-monitoring__chart-title">{ title }</h2>
				{ tooltip && (
					<InfoPopover className="site-monitoring__chart-tooltip">{ tooltip }</InfoPopover>
				) }
			</header>
			<div ref={ uplotContainer }>
				{ isLoading && <Spinner /> }
				<UplotReact
					data={ data }
					onCreate={ ( chart ) => ( uplot.current = chart ) }
					options={ options }
				/>
			</div>
		</div>
	);
};
