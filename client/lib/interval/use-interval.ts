/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
import { TimeoutMS } from 'client/types';

/**
 * useInterval implementation from @see https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 * Used with explicit permission:
 * > Feel free to copy paste it in your project or put it on npm.
 * https://github.com/gaearon/overreacted.io/blob/80c0a314c5d855891220852788f662c2e8ecc7d4/src/pages/making-setinterval-declarative-with-react-hooks/index.md
 */

export function useInterval( callback: () => void, delay: TimeoutMS ) {
	const savedCallback = useRef< typeof callback >();

	// Remember the latest callback.
	useEffect( () => {
		savedCallback.current = callback;
	}, [ callback ] );

	// Set up the interval.
	useEffect( () => {
		function tick() {
			( savedCallback.current as /* savedCallback ref should never be `undefined` */ typeof callback )();
		}
		if ( delay !== null ) {
			const id = setInterval( tick, delay );
			return () => clearInterval( id );
		}
	}, [ delay ] );
}
