/**
 * External Dependencies
 */
import { useEffect, useCallback, useState } from '@wordpress/element';

/**
 * A hook that returns true/false if ref node receives focus by either tabbing or clicking into any of its children.
 *
 * @param ref React.MutableRefObject< null | HTMLElement >
 * @param trapFocus: boolean Whether to trap focus via Tab key
 *
 */
const useFocusHandler = ( ref: React.MutableRefObject< null | HTMLElement >, trapFocus: boolean ): boolean => {
	const [ hasFocus, setHasFocus ] = useState( false );
	const [ firstFocusableElement, setFirstFocusableElement ] = useState<HTMLElement | undefined>();
	const [ lastFocusableElement, setLastFocusableElement ] = useState<HTMLElement | undefined>();

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

	const handleTrapFocus = useCallback(
		( event ) => {
			if ( ! trapFocus ) {
				return;
			}

			if ( event.key === 'Tab' ) {
				if ( event.shiftKey ) { // Shift + Tab
					if ( document.activeElement === firstFocusableElement ) {
						lastFocusableElement?.focus();
						event.preventDefault();
						event.stopPropagation();
					}
				} else { // Tab
					if ( document.activeElement === lastFocusableElement ) {
						firstFocusableElement?.focus();
						event.preventDefault();
						event.stopPropagation();
					}
				}
			}
		},
		[ ref, trapFocus, firstFocusableElement, lastFocusableElement ]
	);

	useEffect( () => {
		const focusableElements = ref.current?.querySelectorAll<HTMLElement>( 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])' );

		setFirstFocusableElement( focusableElements && focusableElements[ 0 ] );
		setLastFocusableElement( focusableElements && focusableElements[ focusableElements.length - 1 ] );

		document.addEventListener( 'focusin', handleFocus );
		document.addEventListener( 'mousedown', handleMousedown );
		document.addEventListener( 'keyup', handleKeyup );
		document.addEventListener( 'keydown', handleTrapFocus );
		return () => {
			document.removeEventListener( 'focusin', handleFocus );
			document.removeEventListener( 'mnousedown', handleMousedown );
			document.removeEventListener( 'keyup', handleKeyup );
			document.removeEventListener( 'keydown', handleTrapFocus );
		};
	}, [ ref.current, handleFocus, handleMousedown, handleKeyup, handleTrapFocus ] );

	return hasFocus;
};

export default useFocusHandler;
