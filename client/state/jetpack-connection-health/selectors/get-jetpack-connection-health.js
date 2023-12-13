import 'calypso/state/jetpack-connection-health/init';

/**
 * Returns Jetpack connection health for a site.
 * @param  {Object}  state         Global state tree
 * @param  {number}  siteId        Site ID
 * @returns {Object|null}          Jetpack connection health
 */
export default function getJetpackConnectionHealth( state, siteId ) {
	return state.jetpackConnectionHealth[ siteId ]?.connectionHealth ?? null;
}
