/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

/*
 * Run a callback function any time one of the dependencies changes
 *
 * This is similar to useEffect, but there are several differences:
 *
 * - This hook will not run its callback the first time it is called; it will
 * only run when one of its dependencies has changed from its previous value.
 *
 * - This hook has no cleanup function. The return value of the callback has no
 * effect.
 *
 * - The callback function will be passed the previous value as an argument.
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
