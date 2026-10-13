import { useCallback, useEffect, useRef } from 'react';
import type { RefCallback } from 'react';

// The names wait for confirmation from data science. Rename them here only.
export const DIFM_OFFER_BANNER_HOVER_EVENT = 'calypso_difm_offer_banner_hover';
export const DIFM_OFFER_BANNER_TEXT_SELECT_EVENT = 'calypso_difm_offer_banner_text_select';

// A pointer that only crosses the banner on its way somewhere else is not interest.
const HOVER_DELAY_MS = 500;
// A drag fires many selection changes. Wait for the user to stop before reading the selection.
const SELECTION_DEBOUNCE_MS = 300;

type TracksProperties = Record< string, string | number | boolean | undefined >;

type RecordEvent = ( eventName: string, properties: TracksProperties ) => void;

/**
 * Count the selected characters inside the element. A selection that starts or ends
 * outside the element counts only its part inside the element.
 */
function getSelectionLengthInside( selection: Selection, element: HTMLElement ): number {
	const elementRange = document.createRange();
	elementRange.selectNodeContents( element );

	let selectedText = '';
	for ( let index = 0; index < selection.rangeCount; index++ ) {
		const range = selection.getRangeAt( index );
		if ( range.collapsed || ! range.intersectsNode( element ) ) {
			continue;
		}

		const insideRange = range.cloneRange();
		if ( insideRange.compareBoundaryPoints( Range.START_TO_START, elementRange ) < 0 ) {
			insideRange.setStart( elementRange.startContainer, elementRange.startOffset );
		}
		if ( insideRange.compareBoundaryPoints( Range.END_TO_END, elementRange ) > 0 ) {
			insideRange.setEnd( elementRange.endContainer, elementRange.endOffset );
		}
		selectedText += insideRange.toString();
	}

	return selectedText.trim() ? selectedText.length : 0;
}

/**
 * Records one hover event and one text-select event per mount of a DIFM offer banner.
 * Attach the returned ref to the banner's root element. The caller supplies `record`,
 * so this hook does not depend on how a surface sends Tracks events.
 */
export function useDifmOfferEngagementTracking(
	record: RecordEvent,
	properties: TracksProperties
): RefCallback< HTMLElement > {
	// Keep the latest values in refs, so a new callback or properties object on each
	// render does not detach the listeners or restart a running timer.
	const recordRef = useRef( record );
	const propertiesRef = useRef( properties );
	useEffect( () => {
		recordRef.current = record;
		propertiesRef.current = properties;
	} );

	const hasRecordedHover = useRef( false );
	const hasRecordedTextSelect = useRef( false );

	return useCallback( ( element: HTMLElement | null ) => {
		if ( ! element ) {
			return;
		}

		let hoverTimer: ReturnType< typeof setTimeout > | undefined;
		let selectionTimer: ReturnType< typeof setTimeout > | undefined;
		// Aborting a controller removes every listener added with its signal.
		const hoverListeners = new AbortController();
		const selectionListeners = new AbortController();

		const handlePointerEnter = () => {
			clearTimeout( hoverTimer );
			hoverTimer = setTimeout( () => {
				hasRecordedHover.current = true;
				hoverListeners.abort();
				recordRef.current( DIFM_OFFER_BANNER_HOVER_EVENT, propertiesRef.current );
			}, HOVER_DELAY_MS );
		};

		const handlePointerLeave = () => {
			clearTimeout( hoverTimer );
		};

		const handleSelectionChange = () => {
			clearTimeout( selectionTimer );
			selectionTimer = setTimeout( () => {
				const selection = document.getSelection();
				const selectionLength = selection ? getSelectionLengthInside( selection, element ) : 0;
				if ( ! selectionLength ) {
					return;
				}

				hasRecordedTextSelect.current = true;
				selectionListeners.abort();
				recordRef.current( DIFM_OFFER_BANNER_TEXT_SELECT_EVENT, {
					...propertiesRef.current,
					selection_length: selectionLength,
				} );
			}, SELECTION_DEBOUNCE_MS );
		};

		if ( ! hasRecordedHover.current ) {
			const { signal } = hoverListeners;
			element.addEventListener( 'pointerenter', handlePointerEnter, { signal } );
			element.addEventListener( 'pointerleave', handlePointerLeave, { signal } );
		}
		if ( ! hasRecordedTextSelect.current ) {
			const { signal } = selectionListeners;
			document.addEventListener( 'selectionchange', handleSelectionChange, { signal } );
		}

		// React calls this cleanup when the element unmounts. A timer that is still
		// running then must not record an event.
		return () => {
			clearTimeout( hoverTimer );
			clearTimeout( selectionTimer );
			hoverListeners.abort();
			selectionListeners.abort();
		};
	}, [] );
}
