import { useEffect } from 'react';
import type { UseInfiniteListResult } from 'calypso/reader/hooks/use-infinite-list';

type ScrollToIndex = UseInfiniteListResult[ 'scrollToIndex' ];

/**
 * Scrolls a layout's own virtualizer so the keyboard-selected row is on screen.
 * `align: 'auto'` only scrolls when the row is off-screen, so click-selection
 * (the list is already steady) never jumps. `selectedIndex` is the row/item
 * index within the layout's virtualized model (which differs from the post index
 * once headers or grid rows are involved), or `-1` when nothing is selected.
 */
export function useScrollSelectedIntoView(
	scrollToIndex: ScrollToIndex,
	selectedIndex: number
): void {
	useEffect( () => {
		if ( selectedIndex >= 0 ) {
			scrollToIndex( selectedIndex, { align: 'auto' } );
		}
	}, [ selectedIndex, scrollToIndex ] );
}
