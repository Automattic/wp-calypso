import { useEvent } from '@wordpress/compose';
import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface UseResourceSelectionOptions {
	/** The selection is held by the host, so the dashboard can keep it in the URL. */
	onSelectedIdChange: ( id: number | null ) => void;
	onPreview: ( resource: AgencyEnablementResource ) => void;
}

/** Opens resources in the details modal. */
export function useResourceSelection( {
	onSelectedIdChange,
	onPreview,
}: UseResourceSelectionOptions ) {
	const preview = ( resource: AgencyEnablementResource ) => {
		onSelectedIdChange( resource.id );
		onPreview( resource );
	};

	// Stable across renders, so memoized cards don't re-render while searching.
	const select: SelectResource = useEvent( ( resource, event ) => {
		// Modified clicks follow the link, opening the details in a new tab or window.
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}

		event.preventDefault();
		preview( resource );
	} );

	return { select, preview, clear: () => onSelectedIdChange( null ) };
}

/** The selected resource and its neighbors among the current results. */
export function getNeighbors( results: AgencyEnablementResource[], selectedId: number | null ) {
	const index = results.findIndex( ( resource ) => resource.id === selectedId );

	return index === -1
		? {}
		: { selected: results[ index ], previous: results[ index - 1 ], next: results[ index + 1 ] };
}
