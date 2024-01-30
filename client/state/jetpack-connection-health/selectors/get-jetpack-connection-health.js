import 'calypso/state/jetpack-connection-health/init';

/**
 * Returns Jetpack connection health for a site.
 * @param  {Object}  state         Global state tree
 * @param  {number}  siteId        Site ID
 * @returns {{ error?: string, jetpack_connection_problem?: boolean } | null}          Jetpack connection health
 */
export default function getJetpackConnectionHealth( state, siteId ) {
	return state?.jetpackConnectionHealth?.[ siteId ]?.connectionHealth ?? null;
}
