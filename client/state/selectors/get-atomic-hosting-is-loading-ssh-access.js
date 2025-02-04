import 'calypso/state/hosting/init';

/**
 * Returns if the SSH access data loaded for given site.
 * @param  {Object}  state   Global state tree
 * @param  {number|null}  siteId The ID of the site we're querying
 * @returns {boolean} If the SSH access data has finished the first request
 */
export function getAtomicHostingIsLoadingSshAccess( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.isLoadingSshAccess ?? true;
}
