import { useCallback, useRef, useLayoutEffect } from 'react';

/**
 * Hook to be used to make sure a function `fn` is called only
 * if the component which uses it is still mounted.
 * @param {Function} fn A function you want to be safe to call
 */
export default function useSafe( fn ) {
	const mounted = useRef( false );

	useLayoutEffect( () => {
		mounted.current = true;
		return () => ( mounted.current = false );
	}, [] );

	return useCallback( ( ...args ) => ( mounted.current ? fn( ...args ) : void 0 ), [ fn ] );
}
