import { useEffect, useRef } from 'react';
import type { TimeoutMS } from 'calypso/types';

/**
 * useInterval implementation from @see https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 * Used with explicit permission:
 * > Feel free to copy paste it in your project or put it on npm.
 * https://github.com/gaearon/overreacted.io/blob/80c0a314c5d855891220852788f662c2e8ecc7d4/src/pages/making-setinterval-declarative-with-react-hooks/index.md
 */

/**
 * Invoke a function on an interval.
 * @param callback Function to invoke
 * @param delay    Interval timeout in MS. `null`, `false`, or a value that is not a positive
 *                 finite number to stop the interval.
 */
export function useInterval( callback: () => void, delay: TimeoutMS | null | false ) {
	const savedCallback = useRef( callback );

	// Remember the latest callback.
	useEffect( () => {
		savedCallback.current = callback;
	}, [ callback ] );

	// Set up the interval.
	useEffect( () => {
		if ( delay === null || delay === false || ! Number.isFinite( delay ) || delay <= 0 ) {
			return;
		}
		const tick = () => void savedCallback.current();
		const id = setInterval( tick, delay );
		return () => clearInterval( id );
	}, [ delay ] );
}
