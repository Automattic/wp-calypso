import { useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION = 400;

const easeOutCubic = ( progress: number ) => 1 - Math.pow( 1 - progress, 3 );

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches;

/**
 * Count a number up from zero when it arrives.
 *
 * Only a rise from zero animates — the first load, and each new date range, which
 * drops the total to zero while it loads. Any other change, including the drop to
 * zero itself, jumps straight to the value. Users who ask for reduced motion get the
 * final value immediately.
 * @param target   The value to settle on.
 * @param duration Animation length in milliseconds.
 * @returns The value to render for the current frame.
 */
export default function useCountUp( target: number, duration = DEFAULT_DURATION ): number {
	const [ value, setValue ] = useState( 0 );
	const valueRef = useRef( 0 );

	useEffect( () => {
		if ( valueRef.current !== 0 || target === 0 || prefersReducedMotion() ) {
			valueRef.current = target;
			setValue( target );
			return;
		}

		let frame = 0;
		const start = performance.now();

		const tick = ( now: number ) => {
			const progress = Math.min( 1, ( now - start ) / duration );
			const next = target * easeOutCubic( progress );
			valueRef.current = next;
			setValue( next );

			if ( progress < 1 ) {
				frame = requestAnimationFrame( tick );
			}
		};

		frame = requestAnimationFrame( tick );
		return () => cancelAnimationFrame( frame );
	}, [ target, duration ] );

	return value;
}
