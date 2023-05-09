import 'calypso/state/hosting/init';

/**
 * Returns the geo affinity used for given siteId
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {string} Geo Affinity, or ''
 */
export function getAtomicHostingGeoAffinity( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.geoAffinity ?? '';
}
