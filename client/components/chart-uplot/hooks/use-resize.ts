import { throttle } from 'lodash';
import { useEffect } from 'react';

const THROTTLE_DURATION = 400; // in ms

export default function useResize(
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
