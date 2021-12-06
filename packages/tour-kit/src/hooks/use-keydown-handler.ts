/* eslint-disable jsdoc/require-param */
/**
 * External Dependencies
 */
import { useEffect, useCallback } from '@wordpress/element';

interface Props {
	onEscape?: () => void;
	onArrowRight?: () => void;
	onArrowLeft?: () => void;
}

/**
 * A hook the applies the respective callbacks in response to keydown events.
 */
const useKeydownHandler = ( { onEscape, onArrowRight, onArrowLeft }: Props ): void => {
	const handleKeydown = useCallback(
		( event: KeyboardEvent ) => {
			let handled = false;

			switch ( event.key ) {
				case 'Escape':
					onEscape && ( onEscape(), ( handled = true ) );
					break;
				case 'ArrowRight':
					onArrowRight && ( onArrowRight(), ( handled = true ) );
					break;
				case 'ArrowLeft':
					onArrowLeft && ( onArrowLeft(), ( handled = true ) );
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

export default useKeydownHandler;
