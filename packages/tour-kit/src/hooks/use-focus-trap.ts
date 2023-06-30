/**
 * External Dependencies
 */
import { focus } from '@wordpress/dom';
import { useEffect, useCallback, useState } from '@wordpress/element';
/**
 * A hook that constraints tabbing/focus on focuable elements in the given element ref.
 *
 * @param ref React.MutableRefObject< null | HTMLElement >
 */
const useFocusTrap = ( ref: React.MutableRefObject< null | HTMLElement > ): void => {
	const [ firstFocusableElement, setFirstFocusableElement ] = useState< HTMLElement | undefined >();
	const [ lastFocusableElement, setLastFocusableElement ] = useState< HTMLElement | undefined >();

	const handleTrapFocus = useCallback(
		( event: KeyboardEvent ) => {
			let handled = false;

			if ( event.key === 'Tab' ) {
				if ( event.shiftKey ) {
					// Shift + Tab
					if ( document.activeElement === firstFocusableElement ) {
						lastFocusableElement?.focus();
						handled = true;
					}
				} else if ( document.activeElement === lastFocusableElement ) {
					// Tab
					firstFocusableElement?.focus();
					handled = true;
				}
			}

			if ( handled ) {
				event.preventDefault();
				event.stopPropagation();
			}
		},
		[ firstFocusableElement, lastFocusableElement ]
	);

	useEffect( () => {
		const focusableElements = ref.current ? focus.focusable.find( ref.current as HTMLElement ) : [];

		if ( focusableElements && focusableElements.length ) {
			setFirstFocusableElement( focusableElements[ 0 ] as HTMLElement );
			setLastFocusableElement( focusableElements[ focusableElements.length - 1 ] as HTMLElement );
		}

		document.addEventListener( 'keydown', handleTrapFocus );

		return () => {
			document.removeEventListener( 'keydown', handleTrapFocus );
		};
	}, [ ref, handleTrapFocus ] );
};

export default useFocusTrap;
