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
 * Opens resources in the details modal, noting which list each was opened from
 * so the modal can move through that list.
 */
export function useResourceSelection( {
	onSelectedIdChange,
	onPreview,
}: UseResourceSelectionOptions ) {
	const [ source, setSource ] = useState< ResourceSource >( 'library' );

	// Moving between resources stays in the list they were opened from.
	const preview = ( resource: AgencyEnablementResource, nextSource: ResourceSource = source ) => {
		setSource( nextSource );
		onSelectedIdChange( resource.id );
		onPreview( resource, nextSource );
	};

	// Stable across renders, so memoized cards don't re-render while searching.
	const select: SelectResource = useEvent( ( resource, event, from = 'library' ) => {
		// Modified clicks follow the link, opening the details in a new tab or window.
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}

		event.preventDefault();
		preview( resource, from );
	} );

	return { source, select, preview, clear: () => onSelectedIdChange( null ) };
}

/** The selected resource and its neighbors among the current results. */
export function getNeighbors( results: AgencyEnablementResource[], selectedId: number | null ) {
	const index = results.findIndex( ( resource ) => resource.id === selectedId );

	return index === -1
		? {}
		: { selected: results[ index ], previous: results[ index - 1 ], next: results[ index + 1 ] };
}
