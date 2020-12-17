/**
 * Internal dependencies
 */
import 'calypso/state/viewers/init';

/**
 * Returns number of total viewers found for a given site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site identifier
 */
export function getTotalViewers( state, siteId ) {
	return state.viewers?.queries[ siteId ]?.found ?? 0;
}

const DEFAULT_VIEWERS = [];

/**
 * Returns all viewers for a given site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site identifier
 */
export function getViewers( state, siteId ) {
	return (
		state.viewers?.queries[ siteId ]?.ids.map( ( id ) => state.viewers?.items[ id ] ) ??
		DEFAULT_VIEWERS
	);
}

/**
 * Returns whether we are currently fetching viewers for a given site.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site identifier
 */
export function isFetchingViewers( state, siteId ) {
	return state.viewers?.fetching[ siteId ] ?? false;
}
