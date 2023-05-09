import { getLocaleSlug, numberFormat, useTranslate } from 'i18n-calypso';
import throttle from 'lodash/throttle';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import uPlot from 'uplot';
import UplotReact from 'uplot-react';

import './style.scss';

// NOTE: Do not include this component in the package entry bundle!
// Doing so will unnecessarily bloat the package bundle size.

const DEFAULT_DIMENSIONS = {
	height: 300,
	width: 1224,
};

const THROTTLE_DURATION = 400; // in ms

function useResize(
	uplotRef: React.RefObject< uPlot >,
	containerRef: React.RefObject< HTMLDivElement >
) {
	useEffect( () => {
		if ( ! uplotRef.current || ! containerRef.current ) {
			return;
		}

		const resizeChart = throttle( () => {
			// Repeat the check since resize can happen much later than event registration.
			if ( ! uplotRef.current || ! containerRef.current ) {
				return;
			}

			// Only update width, not height.
			uplotRef.current.setSize( {
				height: uplotRef.current.height,
				width: containerRef.current.clientWidth,
			} );
		}, THROTTLE_DURATION );
		resizeChart();
		window.addEventListener( 'resize', resizeChart );

		// Cleanup on unmount.
		return () => window.removeEventListener( 'resize', resizeChart );
	}, [ uplotRef, containerRef ] );
}

interface UplotChartProps {
	data: uPlot.AlignedData;
	options?: Partial< uPlot.Options >;
	legendContainer?: React.RefObject< HTMLDivElement >;
	solidFill?: boolean;
}

export default function UplotChart( {
	data,
	options: propOptions,
	legendContainer,
	solidFill = false,
}: UplotChartProps ) {
	const translate = useTranslate();
	const uplot = useRef< uPlot | null >( null );
	const uplotContainer = useRef( null );
	const defaultFillColor = 'rgba(48, 87, 220, 0.4)';
	const { spline } = uPlot.paths;

	// TODO: Refactor this into a separate hook function file.
	const scaleGradient = useCallback(
		(
			u: uPlot,
			scaleKey: string,
			ori: number,
			scaleStops: [ number, string ][],
			discrete = false
		): string | CanvasGradient => {
			const ctx = document.createElement( 'canvas' ).getContext( '2d' );

			const scale = u.scales[ scaleKey ];
			// we want the stop below or at the scaleMax
			// and the stop below or at the scaleMin, else the stop above scaleMin
			let minStopIdx;
			let maxStopIdx;

			if ( scale.min === undefined ) {
				scale.min = 0;
			}

			if ( scale.max === undefined ) {
				scale.max = 0;
			}

			for ( let i = 0; i < scaleStops.length; i++ ) {
				const stopVal = scaleStops[ i ][ 0 ];

				if ( stopVal <= scale.min || minStopIdx == null ) {
					minStopIdx = i;
				}

				maxStopIdx = i;

				if ( stopVal >= scale.max ) {
					break;
				}
			}

			if ( minStopIdx === undefined ) {
				minStopIdx = 0;
			}

			if ( maxStopIdx === undefined ) {
				maxStopIdx = 0;
			}

			if ( minStopIdx === maxStopIdx ) {
				return scaleStops[ minStopIdx ][ 1 ];
			}

			let minStopVal = scaleStops[ minStopIdx ][ 0 ];
			let maxStopVal = scaleStops[ maxStopIdx ][ 0 ];

			if ( minStopVal === -Infinity ) {
				minStopVal = scale.min;
			}

			if ( maxStopVal === Infinity ) {
				maxStopVal = scale.max;
			}

			const minStopPos = u.valToPos( minStopVal, scaleKey, true );
			const maxStopPos = u.valToPos( maxStopVal, scaleKey, true );

			const range = minStopPos - maxStopPos;

			let x0;
			let y0;
			let x1;
			let y1;

			if ( ori === 1 ) {
				x0 = x1 = 0;
				y0 = minStopPos;
				y1 = maxStopPos;
			} else {
				y0 = y1 = 0;
				x0 = minStopPos;
				x1 = maxStopPos;
			}

			const grd = ctx?.createLinearGradient( x0, y0, x1, y1 );

			let prevColor;

			for ( let i = minStopIdx || 0; i <= maxStopIdx; i++ ) {
				const s = scaleStops[ i ];
				let stopPos;

				if ( i === minStopIdx ) {
					stopPos = minStopPos;
				} else {
					stopPos = i === maxStopIdx ? maxStopPos : u.valToPos( s[ 0 ], scaleKey, true );
				}

				const pct = ( minStopPos - stopPos ) / range; // % of max value

				if ( discrete && i > minStopIdx ) {
					grd?.addColorStop( pct, prevColor || 'rgba(0, 0, 0, 0)' );
				}

				grd?.addColorStop( pct, ( prevColor = s[ 1 ] ) );
			}

			return grd || defaultFillColor;
		},
		[ defaultFillColor ]
	);

	const [ options ] = useState< uPlot.Options >(
		useMemo( () => {
			const defaultOptions: uPlot.Options = {
				class: 'calypso-uplot-chart',
				...DEFAULT_DIMENSIONS,
				// Set incoming dates as UTC.
				tzDate: ( ts ) => uPlot.tzDate( new Date( ts * 1e3 ), 'Etc/UTC' ),
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
					},
				],
				cursor: {
					x: false,
					y: false,
				},
				series: [
					{
						label: translate( 'Date' ),
						value: ( self: uPlot, rawValue: number ) => {
							if ( ! rawValue ) {
								return '-';
							}

							return new Date( rawValue * 1000 ).toLocaleDateString( getLocaleSlug() ?? 'en', {
								month: 'long',
								year: 'numeric',
							} );
						},
					},
					{
						fill: solidFill
							? defaultFillColor
							: ( u, seriesIdx ) => {
									// Find min and max values for the visible parts of all y axis' and map it to color values to draw a gradient.
									const s = u.series[ seriesIdx ]; // data set
									const sc = u.scales[ s.scale || 1 ]; // y axis values

									// if values are not initialised default to a solid color
									if ( s.min === Infinity || s.max === -Infinity ) {
										return defaultFillColor;
									}

									let min = Infinity;
									let max = -Infinity;

									// get in-view y range for this scale
									u.series.forEach( ( ser ) => {
										if ( ser.show && ser.scale === s.scale ) {
											min = Math.min( min, ser.min || 0 );
											max = Math.max( max, ser.max || 0 );
										}
									} );

									let range = max - min;

									// if `range` from data is 0, apply axis range
									if ( range === 0 ) {
										range = sc?.max !== undefined && sc?.min !== undefined ? sc.max - sc.min : 0;
										min = sc?.min || 0;
									}

									return scaleGradient( u, s.scale || 'y', 1, [
										[ min + range * 0.0, 'rgba(48, 87, 220, 0)' ],
										[ min + range * 1.0, 'rgba(48, 87, 220, 0.4)' ],
									] );
							  },
						label: translate( 'Subscribers' ),
						stroke: '#3057DC',
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
			defaultFillColor,
			legendContainer,
			propOptions,
			scaleGradient,
			solidFill,
			spline,
			translate,
		] )
	);

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
