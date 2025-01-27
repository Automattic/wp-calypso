import { getLocaleSlug, numberFormat, useTranslate } from 'i18n-calypso';
import { useMemo, useRef } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import useResize from './hooks/use-resize';
import useScaleGradient from './hooks/use-scale-gradient';
import getDateFormat from './lib/get-date-format';
import getGradientFill from './lib/get-gradient-fill';
import getPeriodDateFormat from './lib/get-period-date-format';

import './style.scss';

// NOTE: Do not include this component in the package entry bundle.
//       Doing so will cause tests of the consumer package to break due to uPlot's reliance on matchMedia.
//       https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom.

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 1224,
};

interface UplotChartProps {
	data: uPlot.AlignedData;
	mainColor?: string;
	fillColorFrom?: string;
	fillColorTo?: string;
	options?: Partial< uPlot.Options >;
	legendContainer?: React.RefObject< HTMLDivElement >;
	solidFill?: boolean;
	period?: string;
	yAxisFilter?: uPlot.Axis.Filter | undefined;
}

export default function UplotChart( {
	data,
	mainColor = '#3057DC',
	fillColorFrom = 'rgba(48, 87, 220, 0.4)',
	fillColorTo = 'rgba(48, 87, 220, 0)',
	yAxisFilter = undefined,
	legendContainer,
	options: propOptions,
	solidFill = false,
	period,
}: UplotChartProps ) {
	const translate = useTranslate();
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef( null );
	const { spline } = uPlot.paths;

	const scaleGradient = useScaleGradient( fillColorFrom );

	const options = useMemo( () => {
		const seriesTemplate = {
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

				return numberFormat( rawValue, { decimals: 0 } );
			},
		};

		// Total subscribers series.
		const mainSeries = {
			...seriesTemplate,
			fill: solidFill
				? fillColorFrom
				: getGradientFill( fillColorFrom, fillColorTo, scaleGradient ),
			label: translate( 'Subscribers' ),
			stroke: mainColor,
		};

		// Paid subscribers series.
		const subSeries = {
			...seriesTemplate,
			fill: getGradientFill( 'rgba(230, 139, 40, 0.4)', 'rgba(230, 139, 40, 0)', scaleGradient ),
			label: translate( 'Paid Subscribers' ),
			stroke: '#e68b28',
		};

		const seriesSet = data.length === 3 ? [ mainSeries, subSeries ] : [ mainSeries ];

		const defaultOptions: uPlot.Options = {
			class: 'calypso-uplot-chart',
			...DEFAULT_DIMENSIONS,
			// Set incoming dates as UTC.
			tzDate: ( ts ) => uPlot.tzDate( new Date( ts * 1e3 ), 'Etc/UTC' ),
			// First, it cycles through all possible templates in case they are substitutes.
			fmtDate: ( chartDateStringTemplate: string ) => {
				// The date for a specific point in the chart.
				return ( date ) => getDateFormat( chartDateStringTemplate, date, getLocaleSlug() || 'en' );
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
					side: 1,
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
					filter: yAxisFilter,
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
					label: translate( 'Date' ),
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
				...seriesSet,
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
		mainColor,
		fillColorFrom,
		fillColorTo,
		legendContainer,
		propOptions,
		scaleGradient,
		solidFill,
		spline,
		translate,
		period,
		data,
		yAxisFilter,
	] );

	useResize( uplot, uplotContainer );

	return (
		<div className="calypso-uplot-chart-container" ref={ uplotContainer }>
			<UplotReact
				data={ data }
				onCreate={ ( chart ) => ( uplot.current = chart ) }
				options={ options }
			/>
		</div>
	);
}
