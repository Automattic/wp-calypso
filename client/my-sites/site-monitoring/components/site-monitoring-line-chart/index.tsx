import useResize from '@automattic/components/src/chart-uplot/hooks/use-resize';
import useScaleGradient from '@automattic/components/src/chart-uplot/hooks/use-scale-gradient';
import getGradientFill from '@automattic/components/src/chart-uplot/lib/get-gradient-fill';
import getPeriodDateFormat from '@automattic/components/src/chart-uplot/lib/get-period-date-format';
import classnames from 'classnames';
import { getLocaleSlug, numberFormat, useTranslate } from 'i18n-calypso';
import { useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import useSiteChartTimezone from './use-site-timezone-for-chart';

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 1224,
};

interface UplotChartProps {
	title?: string;
	className?: string;
	data: uPlot.AlignedData;
	fillColor?: string;
	options?: Partial< uPlot.Options >;
	legendContainer?: React.RefObject< HTMLDivElement >;
	solidFill?: boolean;
	period?: string;
	legendLabelLine1: string;
	legendLabelLine2: string;
	fillLine1?: string;
	fillLine2?: string;
	strokeLine1?: string;
	strokeLine2?: string;
}

export function formatChatHour( date: Date ): string {
	const hours = String( date.getHours() ).padStart( 2, '0' );
	const minutes = String( date.getMinutes() ).padStart( 2, '0' );
	return `${ hours }:${ minutes }`;
}

export const SiteMonitoringLineChart = ( {
	title,
	className,
	data,
	fillColor = 'rgba(48, 87, 220, 0.4)',
	legendContainer,
	options: propOptions,
	fillLine1 = 'rgba(6, 117, 196, 0.1)',
	fillLine2 = 'rgba(0, 135, 99, 0.2)',
	solidFill = false,
	period,
	legendLabelLine1 = 'Default text for line 1',
	legendLabelLine2 = 'Default text for line 2',
	strokeLine1 = '#0675C4',
	strokeLine2 = '#008763',
}: UplotChartProps ) => {
	const translate = useTranslate();
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef( null );
	const { spline } = uPlot.paths;
	const timezone = useSiteChartTimezone();

	const scaleGradient = useScaleGradient( fillColor );

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
						fill: fillLine1,
						label: legendLabelLine1,
						stroke: strokeLine1,
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
					{
						fill: fillLine2,
						label: legendLabelLine2,
						stroke: strokeLine2,
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
			fillLine1,
			fillLine2,
			legendContainer,
			legendLabelLine1,
			legendLabelLine2,
			period,
			propOptions,
			spline,
			strokeLine1,
			strokeLine2,
			translate,
		] )
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
