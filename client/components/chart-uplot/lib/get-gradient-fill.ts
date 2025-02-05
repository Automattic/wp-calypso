import type { ScaleGradientFunction } from '../hooks/use-scale-gradient';
import type uPlot from 'uplot';

export default function getGradientFill(
	fillColorFrom: string,
	fillColorTo: string,
	scaleGradient: ScaleGradientFunction
): ( self: uPlot, seriesIdx: number ) => CanvasRenderingContext2D[ 'fillStyle' ] {
	return ( u, seriesIdx ) => {
		// Find min and max values for the visible parts of all y axis' and map it to color values to draw a gradient.
		const s = u.series[ seriesIdx ]; // data set
		const sc = u.scales[ s.scale || 1 ]; // y axis values

		// if values are not initialised default to a solid color
		if ( s.min === Infinity || s.max === -Infinity ) {
			return fillColorFrom;
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
			[ min + range * 0.0, fillColorTo ],
			[ min + range * 1.0, fillColorFrom ],
		] );
	};
}
