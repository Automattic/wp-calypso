/**
 * Returns the PHP version used for given siteId
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {string} PHP Version used, or ''
 */
export function isUpdatingAtomicPhpVersion( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.isUpdatingPhpVersion;
}
