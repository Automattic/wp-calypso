import { useCallback, useEffect } from 'react';
import * as React from 'react';

/**
 * Hook that executes `callback` is the 'Escape' key is pressed
 * or if the user clicks outside of `ref`.
 *
 * @param ref        Ref to an HTML element
 * @param callback   Function to be executed
 * @param useCapture useCapture flag passed to the add/removeEventListener
 */
export default function useOutsideClickCallback(
	ref: React.MutableRefObject< null | HTMLElement >,
	callback: () => void,
	useCapture?: boolean
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
		document.addEventListener( 'keydown', handleEscape, useCapture );
		document.addEventListener( 'click', handleClick, useCapture );

		return () => {
			document.removeEventListener( 'keydown', handleEscape, useCapture );
			document.removeEventListener( 'click', handleClick, useCapture );
		};
	}, [ handleClick, handleEscape, useCapture ] );
}
