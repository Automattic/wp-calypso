import { useEvent } from '@wordpress/compose';
import { useState } from 'react';
import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface UseResourceSelectionOptions {
	onPreview: ( resource: AgencyEnablementResource ) => void;
	onOpen: ( resource: AgencyEnablementResource ) => void;
}

/**
 * Tracks which resource the details modal shows, and where it was opened from
 * so the modal can grow out of that card or row.
 */
export function useResourceSelection( { onPreview, onOpen }: UseResourceSelectionOptions ) {
	const [ selectedId, setSelectedId ] = useState< number | null >( null );
	const [ origin, setOrigin ] = useState< DOMRect >();

	const preview = ( resource: AgencyEnablementResource ) => {
		setSelectedId( resource.id );
		onPreview( resource );
	};

	// Stable across renders, so memoised cards don't re-render while searching.
	const select: SelectResource = useEvent( ( resource, event ) => {
		// Modified clicks follow the link and open the resource itself.
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			onOpen( resource );
			return;
		}

		event.preventDefault();
		setOrigin(
			( event.currentTarget as Element )
				.closest( '.dashboard-resources-learn__card, tr' )
				?.getBoundingClientRect()
		);
		preview( resource );
	} );

	return { selectedId, origin, select, preview, clear: () => setSelectedId( null ) };
}

/** The selected resource and its neighbours among the current results. */
export function getNeighbours( results: AgencyEnablementResource[], selectedId: number | null ) {
	const index = results.findIndex( ( resource ) => resource.id === selectedId );

	return index === -1
		? {}
		: { selected: results[ index ], previous: results[ index - 1 ], next: results[ index + 1 ] };
}
