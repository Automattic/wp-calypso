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
