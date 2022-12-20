import 'calypso/state/edge-cache/init';

/**
 * Returns the active value for the Edge Cache
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {string} 0 - disabled, 1 - enabled
 */
export function getEdgeCacheActive( state, siteId ) {
	return state.edgeCache?.[ siteId ]?.active ?? null;
}
