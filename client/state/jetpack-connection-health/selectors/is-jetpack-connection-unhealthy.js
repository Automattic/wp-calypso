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
	const connection_data = state.jetpackConnectionHealth?.[ siteId ];

	if ( ! connection_data ) {
		return null;
	}

	return (
		true === connection_data.jetpack_connection_problem && false === connection_data.is_healthy
	);
}
