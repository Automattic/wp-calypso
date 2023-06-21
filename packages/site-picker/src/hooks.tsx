import { focus } from '@wordpress/dom';
import { useCallback, useEffect } from 'react';

export const useArrowNavigation = (
	enabled: boolean,
	element: HTMLElement | null,
	open: boolean,
	onOpen: () => void
) => {
	const handleTrapFocus = useCallback(
		( event: KeyboardEvent ) => {
			const focusableElements = (
				element ? focus.focusable.find( element ) : []
			) as HTMLButtonElement[];

			let focusedIndex = focusableElements.findIndex( ( el ) => document.activeElement === el );
			focusedIndex = focusedIndex === -1 ? 0 : focusedIndex;

			if ( event.key === 'ArrowUp' ) {
				let index = focusedIndex - 1;
				if ( index < 0 ) {
					index = focusableElements.length - 1;
				}
				focusableElements[ index ]?.focus();
			} else if ( event.key === 'ArrowDown' ) {
				const index = ( focusedIndex + 1 ) % focusableElements.length;
				focusableElements[ index ]?.focus();
				if ( ! open ) {
					onOpen();
				}
			}

			if ( [ 'ArrowUp', 'ArrowDown' ].includes( event.key ) ) {
				event.preventDefault();
				event.stopPropagation();
			}
		},
		[ element, open, onOpen ]
	);

	useEffect( () => {
		if ( enabled ) {
			document.addEventListener( 'keydown', handleTrapFocus );
		}

		return () => {
			document.removeEventListener( 'keydown', handleTrapFocus );
		};
	}, [ handleTrapFocus, enabled ] );
};
