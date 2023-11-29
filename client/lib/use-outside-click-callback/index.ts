import { useCallback, useEffect } from 'react';
import * as React from 'react';

/**
 * Hook that executes `callback` is the 'Escape' key is pressed
 * or if the user clicks outside of `ref`.
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
		( { target }: MouseEvent ) => {
			if ( ref.current && ! ref.current.contains( target as Node ) ) {
				callback();
			}
		},
		[ ref, callback ]
	);

	useEffect( () => {
		// HACK: adding these event listeners synchronously causes a mysterious
		// race condition on some pages, but delaying them via setTimeout
		// seems to take care of it.
		setTimeout( () => {
			document.addEventListener( 'keydown', handleEscape );
			document.addEventListener( 'click', handleClick );
		}, 0 );

		return () => {
			document.removeEventListener( 'keydown', handleEscape );
			document.removeEventListener( 'click', handleClick );
		};
	}, [ handleClick, handleEscape ] );
}
