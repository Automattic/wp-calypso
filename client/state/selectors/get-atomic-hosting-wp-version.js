import 'calypso/state/hosting/init';

/**
 * Returns the WordPress version used for given siteId
 * @param  {Object}  state   Global state tree
 * @param  {number|null}  siteId The ID of the site we're querying
 * @returns {string} WP Version used, or ''
 */
export function getAtomicHostingWpVersion( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.wpVersion ?? '';
}
