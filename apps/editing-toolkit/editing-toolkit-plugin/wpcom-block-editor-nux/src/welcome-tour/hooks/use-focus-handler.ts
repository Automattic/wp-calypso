/**
 * External Dependencies
 */
import { useEffect, useCallback, useState } from '@wordpress/element';

/**
 * A hook that returns true/false if ref node receives focus by either tabbing or clicking into any of its children.
 *
 * @param ref React.MutableRefObject< null | HTMLElement >
 *
 */
const useFocusHandler = (
	ref: React.MutableRefObject< null | HTMLElement >
): boolean => {
	const [ hasFocus, setHasFocus ] = useState( false );

	const handleFocus = useCallback( () => {
		if ( document.hasFocus() && ref.current?.contains( document.activeElement ) ) {
			setHasFocus( true );
		} else {
			setHasFocus( false );
		}
	}, [ ref ] );

	const handleMousedown = useCallback(
		( event ) => {
			if ( ref.current?.contains( event.target ) ) {
				setHasFocus( true );
			} else {
				setHasFocus( false );
			}
		},
		[ ref ]
	);

	const handleKeyup = useCallback(
		( event ) => {
			if ( event.key === 'Tab' ) {
				if ( ref.current?.contains( event.target ) ) {
					setHasFocus( true );
				} else {
					setHasFocus( false );
				}
			}
		},
		[ ref ]
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
	}, [ ref.current, handleFocus, handleMousedown, handleKeyup ] );

	return hasFocus;
};

export default useFocusHandler;
