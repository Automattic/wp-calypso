import { useEvent } from '@wordpress/compose';
import { useState } from 'react';
import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface UseResourceSelectionOptions {
	/** The selection is held by the host, so the dashboard can keep it in the URL. */
	onSelectedIdChange: ( id: number | null ) => void;
	onPreview: ( resource: AgencyEnablementResource ) => void;
	onOpen: ( resource: AgencyEnablementResource ) => void;
}

/**
 * Opens resources in the details modal, noting where each was opened from so
 * the modal can grow out of that card or row.
 */
export function useResourceSelection( {
	onSelectedIdChange,
	onPreview,
	onOpen,
}: UseResourceSelectionOptions ) {
	const [ origin, setOrigin ] = useState< DOMRect >();

	const preview = ( resource: AgencyEnablementResource ) => {
		onSelectedIdChange( resource.id );
		onPreview( resource );
	};

	// Stable across renders, so memoized cards don't re-render while searching.
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

	return { origin, select, preview, clear: () => onSelectedIdChange( null ) };
}

/** The selected resource and its neighbors among the current results. */
export function getNeighbors( results: AgencyEnablementResource[], selectedId: number | null ) {
	const index = results.findIndex( ( resource ) => resource.id === selectedId );

	return index === -1
		? {}
		: { selected: results[ index ], previous: results[ index - 1 ], next: results[ index + 1 ] };
}
