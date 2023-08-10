import useResize from '@automattic/components/src/chart-uplot/hooks/use-resize';
import classnames from 'classnames';
import { numberFormat } from 'i18n-calypso';
import { useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import InfoPopover from 'calypso/components/info-popover';

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
	lines: Array< SeriesProp >;
}

interface SeriesProp {
	fill: string;
	label: string;
	stroke: string;
}

export function formatChatHour( date: Date ): string {
	const hours = String( date.getHours() ).padStart( 2, '0' );
	const minutes = String( date.getMinutes() ).padStart( 2, '0' );
	return `${ hours }:${ minutes }`;
}

function createSeries( lines: Array< SeriesProp > ) {
	const { spline } = uPlot.paths;
	const configuredSeries = lines.map( function ( line ) {
		return {
			...line,
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

export const SiteMonitoringLineChart = ( {
	title,
	tooltip,
	className,
	data,
	legendContainer,
	options: propOptions,
	lines,
}: UplotChartProps ) => {
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef( null );

	const [ options ] = useState< uPlot.Options >(
		useMemo( () => {
			const defaultOptions: uPlot.Options = {
				class: 'calypso-uplot-chart',
				...DEFAULT_DIMENSIONS,
				// Set incoming dates as UTC.
				tzDate: ( ts ) => uPlot.tzDate( new Date( ts * 1e3 ), 'Etc/UTC' ),
				fmtDate: () => {
					return ( date ) => {
						const chatHour = formatChatHour( date );
						return `${ chatHour }`;
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
				series: createSeries( lines ),
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
		}, [ legendContainer, lines, propOptions ] )
	);

	useResize( uplot, uplotContainer );

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
				<UplotReact
					data={ data }
					onCreate={ ( chart ) => ( uplot.current = chart ) }
					options={ options }
				/>
			</div>
		</div>
	);
};
