import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing multiple named timeouts with automatic cleanup
 * Prevents memory leaks and race conditions in timeout management
 */
export function useMultiTimeout() {
	// Map to track all active timeouts by name
	const timeoutsRef = useRef< Map< string, NodeJS.Timeout > >( new Map() );

	const clearNamedTimeout = useCallback( ( name: string ) => {
		const timeoutId = timeoutsRef.current.get( name );
		if ( timeoutId ) {
			clearTimeout( timeoutId );
			timeoutsRef.current.delete( name );
		}
	}, [] );

	const setNamedTimeout = useCallback(
		( name: string, callback: () => void, delay: number ) => {
			// Always clear existing timeout with same name first
			clearNamedTimeout( name );

			// Set new timeout and track it
			const timeoutId = setTimeout( callback, delay );
			timeoutsRef.current.set( name, timeoutId );

			return timeoutId;
		},
		[ clearNamedTimeout ]
	);

	const clearAllTimeouts = useCallback( () => {
		// Clear all active timeouts
		timeoutsRef.current.forEach( ( timeoutId ) => {
			clearTimeout( timeoutId );
		} );
		timeoutsRef.current.clear();
	}, [] );

	const hasTimeout = useCallback( ( name: string ) => {
		return timeoutsRef.current.has( name );
	}, [] );

	// Automatic cleanup on component unmount
	useEffect( () => {
		return clearAllTimeouts;
	}, [ clearAllTimeouts ] );

	return {
		setNamedTimeout,
		clearNamedTimeout,
		clearAllTimeouts,
		hasTimeout,
	};
}
