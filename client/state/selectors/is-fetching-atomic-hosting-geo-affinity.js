import 'calypso/state/hosting/init';

/**
 * Whether or not we're currently fetching geo affinity.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {boolean}
 */
export function isFetchingAtomicHostingGeoAffinity( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.isFetchingGeoAffinity;
}
