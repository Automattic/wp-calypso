/* eslint-disable jsdoc/require-param */
/**
 * External Dependencies
 */
import { useEffect, useCallback, useRef } from '@wordpress/element';
import useFocus from './use-focus';

/**
 * A hook the applies the respective callbacks in response to keydown events.
 * If a ref object is passed then it reacts when the reference node or any of its
 * children are focused by clicking or tabbing into (see `useFocus` hook).
 */
const useKeyboardNavigation = (
	onEscape: () => void,
	onArrowRight: () => void,
	onArrowLeft: () => void,
	ref: React.MutableRefObject< null | HTMLElement > | undefined
): void => {
	const nullRef = useRef( null );
	const isReferenceFocused = useFocus( ref || nullRef );
	const handleKeydown = useCallback(
		( event: KeyboardEvent ) => {
			const onFocusReference = typeof ref === 'object';

			if ( onFocusReference && ! isReferenceFocused ) {
				return;
			}

			let handled = false;

			switch ( event.key ) {
				case 'Escape':
					onEscape();
					handled = true;
					break;
				case 'ArrowRight':
					onArrowRight();
					handled = true;
					break;
				case 'ArrowLeft':
					onArrowLeft();
					handled = true;
					break;
				default:
					break;
			}

			if ( handled ) {
				event.preventDefault();
				event.stopPropagation();
			}
		},
		[ ref, isReferenceFocused, onEscape, onArrowRight, onArrowLeft ]
	);

	useEffect( () => {
		document.addEventListener( 'keydown', handleKeydown );

		return () => {
			document.removeEventListener( 'keydown', handleKeydown );
		};
	}, [ handleKeydown ] );
};

export default useKeyboardNavigation;
