import { useCallback } from 'react';
import type uPlot from 'uplot';

export type ScaleGradientFunction = (
	u: uPlot,
	scaleKey: string,
	ori: number,
	scaleStops: [ number, string ][],
	discrete?: boolean
) => CanvasRenderingContext2D[ 'fillStyle' ];

export default function useScaleGradient( backupColor: string ) {
	return useCallback< ScaleGradientFunction >(
		( u, scaleKey, ori, scaleStops, discrete = false ) => {
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

			const gradient = ctx?.createLinearGradient( x0, y0, x1, y1 );

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
					gradient?.addColorStop( pct, prevColor || 'rgba(0, 0, 0, 0)' );
				}

				gradient?.addColorStop( pct, ( prevColor = s[ 1 ] ) );
			}

			return gradient || backupColor;
		},
		[ backupColor ]
	);
}
