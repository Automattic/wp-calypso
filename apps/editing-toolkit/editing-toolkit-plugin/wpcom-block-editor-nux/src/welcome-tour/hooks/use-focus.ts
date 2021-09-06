import { useEffect, useCallback, useState } from '@wordpress/element';

/**
 * Returns true/false whether ref is focused either by tab-ing or clicking into any of its children.
 *
 * @param ref React.MutableRefObject< null | HTMLElement >
 */
const useFocus = ( ref: React.MutableRefObject< null | HTMLElement > ): boolean => {
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
		document.addEventListener( 'focus', handleFocus );
		document.addEventListener( 'mousedown', handleMousedown );
		document.addEventListener( 'keyup', handleKeyup );
		return () => {
			document.removeEventListener( 'focus', handleFocus );
			document.removeEventListener( 'mnousedown', handleMousedown );
			document.removeEventListener( 'keyup', handleKeyup );
		};
	}, [ handleFocus, handleMousedown, handleKeyup ] );

	return hasFocus;
};

export default useFocus;
