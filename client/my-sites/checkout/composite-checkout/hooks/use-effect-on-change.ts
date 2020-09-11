/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

/*
 * Run a callback function any time one of the dependencies changes
 *
 * Similar to useEffect but will not run its effects on the first call.
 *
 * Also, there is no clean-up function (the return value of the callback has no effect).
 */
export default function useEffectOnChange< T >(
	handleChange: ( previous: T[] ) => void,
	dependencies: T[]
): void {
	const previous = useRef( dependencies );
	useEffect( () => {
		let didChange = false;
		dependencies.forEach( ( value, index ) => {
			if ( value !== previous.current[ index ] ) {
				didChange = true;
			}
		} );
		if ( didChange ) {
			handleChange( previous.current );
		}
		previous.current = dependencies;
		// Only depend on the dependencies; if handleChange is an anonymous
		// function, there's no need to run this every time it changes.
	}, dependencies ); // eslint-disable-line react-hooks/exhaustive-deps
}
