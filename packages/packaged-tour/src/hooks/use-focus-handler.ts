/**
 * External Dependencies
 */
import { useEffect, useCallback, useState } from '@wordpress/element';

/**
 * A hook that returns true/false if ref node receives focus by either tabbing or clicking into any of its children.
 *
 * @param element HTMLElement | null
 */
const useFocusHandler = ( element: HTMLElement | null ): boolean => {
	const [ hasFocus, setHasFocus ] = useState( false );

	const handleFocus = useCallback( () => {
		if ( document.hasFocus() && element?.contains( document.activeElement ) ) {
			setHasFocus( true );
		} else {
			setHasFocus( false );
		}
	}, [ element ] );

	const handleMousedown = useCallback(
		( event ) => {
			if ( element?.contains( event.target ) ) {
				setHasFocus( true );
			} else {
				setHasFocus( false );
			}
		},
		[ element ]
	);

	const handleKeyup = useCallback(
		( event ) => {
			if ( event.key === 'Tab' ) {
				if ( element?.contains( event.target ) ) {
					setHasFocus( true );
				} else {
					setHasFocus( false );
				}
			}
		},
		[ element ]
	);

	useEffect( () => {
		document.addEventListener( 'focusin', handleFocus );
		document.addEventListener( 'mousedown', handleMousedown );
		document.addEventListener( 'keyup', handleKeyup );

		return () => {
			document.removeEventListener( 'focusin', handleFocus );
			document.removeEventListener( 'mnousedown', handleMousedown );
			document.removeEventListener( 'keyup', handleKeyup );
		};
	}, [ handleFocus, handleKeyup, handleMousedown ] );

	return hasFocus;
};

export default useFocusHandler;
