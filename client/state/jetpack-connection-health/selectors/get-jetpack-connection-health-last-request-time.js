import 'calypso/state/jetpack-connection-health/init';

/**
 * Returns Jetpack connection health for a site.
 * @param  {Object}  state         Global state tree
 * @param  {number}  siteId        Site ID
 * @returns {number|null}       Last request time for Jetpack connection health check
 */
export default function getJetpackConnectionHealthLastRequestTime( state, siteId ) {
	return state.jetpackConnectionHealth?.[ siteId ]?.lastRequestTime ?? null;
}
