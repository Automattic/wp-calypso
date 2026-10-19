import { useEvent } from '@wordpress/compose';
import { useState } from 'react';
import type { ResourceSource, SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface UseResourceSelectionOptions {
	/** The selection is held by the host, so the dashboard can keep it in the URL. */
	onSelectedIdChange: ( id: number | null ) => void;
	onPreview: ( resource: AgencyEnablementResource, source: ResourceSource ) => void;
}

/**
 * Opens resources in the details modal, noting where each was opened from so
 * the modal can grow out of that card or row, and which list it was opened
 * from so the modal can move through that list.
 */
export function useResourceSelection( {
	onSelectedIdChange,
	onPreview,
}: UseResourceSelectionOptions ) {
	const [ origin, setOrigin ] = useState< DOMRect >();
	const [ source, setSource ] = useState< ResourceSource >( 'library' );

	// Moving between resources stays in the list they were opened from.
	const preview = ( resource: AgencyEnablementResource, nextSource: ResourceSource = source ) => {
		setSource( nextSource );
		onSelectedIdChange( resource.id );
		onPreview( resource, nextSource );
	};

	// Stable across renders, so memoized cards don't re-render while searching.
	const select: SelectResource = useEvent( ( resource, event, originElement, from = 'library' ) => {
		// Modified clicks follow the link, opening the details in a new tab or window.
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}

		event.preventDefault();
		const target = event.currentTarget as Element;
		// DataViews renders the list's rows, so a row is found from its link.
		setOrigin( ( originElement ?? target.closest( 'tr' ) ?? target ).getBoundingClientRect() );
		preview( resource, from );
	} );

	return { origin, source, select, preview, clear: () => onSelectedIdChange( null ) };
}

/** The selected resource and its neighbors among the current results. */
export function getNeighbors( results: AgencyEnablementResource[], selectedId: number | null ) {
	const index = results.findIndex( ( resource ) => resource.id === selectedId );

	return index === -1
		? {}
		: { selected: results[ index ], previous: results[ index - 1 ], next: results[ index + 1 ] };
}
