import 'calypso/state/jetpack-connection-health/init';

/**
 * Returns true if the current site Jetpack connection was checked and is unhealthy
 * @param  {Object}  state         Global state tree
 * @param  {number}  siteId        Site ID
 * @returns {?Object}             Whether the current site can have connection problem
 */
export default function getJetpackConnectionHealth( state, siteId ) {
	if ( ! siteId ) {
		return null;
	}
	const siteState = state.jetpackConnectionHealth[ siteId ];

	return siteState?.connectionHealth;
}
