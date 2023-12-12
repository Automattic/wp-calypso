import 'calypso/state/jetpack-connection-health/init';

/**
 * Returns true if the current site Jetpack connection was checked and is unhealthy
 * @param  {Object}  state         Global state tree
 * @param  {number}  siteId        Site ID
 * @returns {?boolean}             Whether the current site can have connection problem
 */
export default function isJetpackConnectionUnhealthy( state, siteId ) {
	if ( ! siteId ) {
		return null;
	}
	const siteState = state.jetpackConnectionHealth[ siteId ];

	if ( ! siteState?.connectionHealth ) {
		return null;
	}

	return (
		true === siteState.connectionHealth.jetpack_connection_problem &&
		false === siteState.connectionHealth.is_healthy
	);
}
