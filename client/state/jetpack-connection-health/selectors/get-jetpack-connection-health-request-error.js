import 'calypso/state/jetpack-connection-health/init';

/**
 * Returns error code if the current site has possible Jetpack connection problem
 * @param  {Object}  state         Global state tree
 * @param  {number}  siteId        Site ID
 * @returns {string|null}              Connection error code
 */
export default function getJetpackConnectionHealthRequestError( state, siteId ) {
	return state.jetpackConnectionHealth?.[ siteId ]?.requestError ?? null;
}
