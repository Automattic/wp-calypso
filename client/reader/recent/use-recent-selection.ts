import { View } from '@wordpress/dataviews';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	isPaddingStreamItem,
	type StreamItem,
	type StreamListItem,
} from 'calypso/reader/data/stream';
import { getStreamItemKey } from './utils';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

interface UseRecentSelectionOptions {
	isWide: boolean;
	streamItems: StreamListItem[];
	view: View;
	setView: Dispatch< SetStateAction< View > >;
	// The sidebar-selected feed. When it changes we reset the selection and page.
	selectedFeedId: number | null;
	// Focused when a row is picked, so keyboard users land in the full-post pane.
	postColumnRef: MutableRefObject< HTMLDivElement | null >;
}

interface UseRecentSelectionResult {
	selectedItem: StreamItem | null;
	setSelectedItem: Dispatch< SetStateAction< StreamItem | null > >;
	selectItem: ( item: StreamItem ) => void;
	handleChangeView: ( newView: View ) => void;
}

/**
 * Owns the Recent view's post selection and the pagination behavior that keeps
 * it stable: recomputing the page on per-page changes and auto-selecting the
 * first post on page changes, while preserving an existing selection.
 */
export function useRecentSelection( {
	isWide,
	streamItems,
	view,
	setView,
	selectedFeedId,
	postColumnRef,
}: UseRecentSelectionOptions ): UseRecentSelectionResult {
	const [ selectedItem, setSelectedItem ] = useState< StreamItem | null >( null );
	// Latest selection, read by the page auto-select effect without making that
	// effect re-run on every selection change (which would fight full-post
	// keyboard navigation that legitimately selects an off-page post).
	const selectedItemRef = useRef< StreamItem | null >( selectedItem );
	selectedItemRef.current = selectedItem;
	// Set when a per-page change should keep the current selection. Consumed by
	// the auto-select effect once the new page loads so it doesn't replace the
	// selection (page/per-page index math doesn't survive x-post collapsing, so
	// the range check alone can misfire and swap to a different post).
	const preserveSelectionRef = useRef( false );

	const selectItem = useCallback(
		( item: StreamItem ) => {
			setSelectedItem( item );
			setTimeout( () => {
				postColumnRef.current?.focus();
			}, 0 );
		},
		[ postColumnRef ]
	);

	const handleChangeView = useCallback(
		( newView: View ) => {
			const perPageChanged =
				newView.perPage != null && view.perPage != null && newView.perPage !== view.perPage;

			// DataViews always resets to page 1 when the per-page size changes. Instead,
			// keep the current selection (or the top of the current page when nothing is
			// selected) in view by recomputing which page it lands on under the new size.
			if ( perPageChanged && newView.perPage ) {
				const currentPerPage = view.perPage ?? 1;
				const currentPage = view.page ?? 1;

				const selectedKey = selectedItem ? getStreamItemKey( selectedItem ) : null;
				const selectedIndex =
					selectedKey != null
						? streamItems.findIndex( ( item ) => getStreamItemKey( item ) === selectedKey )
						: -1;
				const anchorIndex =
					selectedIndex >= 0 ? selectedIndex : ( currentPage - 1 ) * currentPerPage;

				// Keep the current selection across the refetch instead of letting the
				// effect re-select the new page's first item.
				preserveSelectionRef.current = selectedItem != null;

				setView( {
					...newView,
					page: Math.floor( anchorIndex / newView.perPage ) + 1,
				} );
				return;
			}

			setView( { ...newView } );
		},
		[ selectedItem, streamItems, view.page, view.perPage, setView ]
	);

	// On page/per-page/stream changes, select the first item on the current page,
	// unless the current selection is already within that page's range (e.g.
	// preserved across a per-page change). Reading the selection from a ref keeps
	// this effect off the `selectedItem` dependency, so selecting an off-page post
	// (full-post keyboard navigation) is not reverted here.
	//
	// While navigating to a not-yet-loaded page, the first slot is empty, so the
	// selection is cleared to `null` — which lets the full-post pane show its
	// loading state — and the real first item is selected once the page settles.
	// A per-page change instead sets `preserveSelectionRef` so the selection is
	// kept as-is once the new page loads (no loading flash, no swap to a
	// different post), independent of the fragile page/per-page index math.
	useEffect( () => {
		if ( isWide && streamItems.length > 0 && view.page && view.perPage ) {
			// A per-page change wants to keep the current selection. The new page has
			// now loaded (streamItems is non-empty), so consume the flag and leave the
			// selection untouched. (On a narrow viewport this branch never runs, so the
			// flag lingers until the next wide-viewport pass, where it's consumed
			// harmlessly — it only ever preserves the current selection.)
			if ( preserveSelectionRef.current ) {
				preserveSelectionRef.current = false;
				if ( selectedItemRef.current ) {
					return;
				}
			}

			const pageStart = ( view.page - 1 ) * view.perPage;
			const pageEnd = pageStart + view.perPage;

			const currentSelection = selectedItemRef.current;
			if ( currentSelection ) {
				const selectedKey = getStreamItemKey( currentSelection );
				const selectedOnPage = streamItems
					.slice( pageStart, pageEnd )
					.some( ( item ) => getStreamItemKey( item ) === selectedKey );
				if ( selectedOnPage ) {
					return;
				}
			}

			const firstOnPage = streamItems[ pageStart ];
			setSelectedItem( firstOnPage && ! isPaddingStreamItem( firstOnPage ) ? firstOnPage : null );
		}
	}, [ isWide, streamItems, view ] );

	// When the selected feed changes, clear the selected item and reset the page to 1.
	useEffect( () => {
		setSelectedItem( null );
		setView( ( prevView ) => ( {
			...prevView,
			page: 1,
		} ) );
	}, [ selectedFeedId, setView ] );

	return { selectedItem, setSelectedItem, selectItem, handleChangeView };
}
