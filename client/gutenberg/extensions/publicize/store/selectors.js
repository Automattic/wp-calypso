/**
 * Returns the failed Publicize connections.
 *
 * @param {Object} state State object.
 *
 * @return {Array} List of connections.
 */
export function getFailedConnections( state ) {
	return state.filter( connection => ! connection.test_success );
}
