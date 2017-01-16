/**
 * Internal dependencies
 */
import MediaQueryManager from 'lib/query-manager/media';

export function isRequestingMediaItems( state, siteId, query ) {
	return state.media.queryRequests[ siteId + ':' + MediaQueryManager.QueryKey.stringify( query ) ];
}

export function getMediaItemsForQuery( state, siteId, query ) {
	const manager = state.media.queries[ siteId ];

	if ( ! manager ) {
		return null;
	}

	return manager.getItemsIgnoringPage( query );
}

export function getMediaItemsFoundForQuery( state, siteId, query ) {
	const manager = state.media.queries[ siteId ];

	if ( ! manager ) {
		return null;
	}

	return manager.getFound( query );
}

export function getSelectedMediaIds( state, siteId ) {
	return state.media.selected[ siteId ] || [];
}

export function getSelectedMediaItems( state, siteId ) {
	const manager = state.media.queries[ siteId ];
	const selected = state.media.selected[ siteId ];

	if ( ! manager || ! selected ) {
		return [];
	}

	return selected.map( id => manager.getItem( id ) );
}
