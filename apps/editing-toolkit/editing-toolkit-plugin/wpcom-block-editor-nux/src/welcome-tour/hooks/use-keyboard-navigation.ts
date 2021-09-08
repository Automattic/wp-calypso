/**
 * External Dependencies
 */
import { useEffect, useCallback } from '@wordpress/element';

const useKeyboardNavigation = (
	onEscape: () => void,
	onArrowRight: () => void,
	onArrowLeft: () => void
): void => {
	const handleKeydown = useCallback(
		( event: KeyboardEvent ) => {
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
		[ onEscape, onArrowRight, onArrowLeft ]
	);

	useEffect( () => {
		document.addEventListener( 'keydown', handleKeydown );

		return () => {
			document.removeEventListener( 'keydown', handleKeydown );
		};
	}, [ handleKeydown ] );
};

export default useKeyboardNavigation;
