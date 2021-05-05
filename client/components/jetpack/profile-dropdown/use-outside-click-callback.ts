/**
 * External dependencies
 */
import React, { useCallback, useEffect } from 'react';

/**
 * Hook that executes `callback` is the 'Escape' key is pressed
 * or if the user clicks outside of `ref`.
 *
 * @param ref       Ref to an HTML element
 * @param callback  Function to be executed
 */
export default function useOutsideClickCallback(
	ref: React.MutableRefObject< null | HTMLElement >,
	callback: () => void
): void {
	const handleEscape = useCallback(
		( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				callback();
			}
		},
		[ callback ]
	);

	const handleClick = useCallback(
		( { target } ) => {
			if ( ref.current && ! ref.current.contains( target ) ) {
				callback();
			}
		},
		[ ref, callback ]
	);

	useEffect( () => {
		document.addEventListener( 'keydown', handleEscape );
		document.addEventListener( 'click', handleClick );

		return () => {
			document.removeEventListener( 'keydown', handleEscape );
			document.removeEventListener( 'click', handleClick );
		};
	}, [ handleClick, handleEscape ] );
}
