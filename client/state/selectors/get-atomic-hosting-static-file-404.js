import 'calypso/state/hosting/init';

/**
 * Returns the PHP version used for given siteId
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {string} PHP Version used, or ''
 */
export function getAtomicHostingStaticFile404( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.staticFile404 ?? '';
}
