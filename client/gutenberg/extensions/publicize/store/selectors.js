/**
 * Returns the failed Publicize connections.
 *
 * @param {Object} state State object.
 *
 * @return {Array} List of connections.
 */
export function getFailedConnections( state ) {
	return state.filter( connection => false === connection.test_success );
}

/**
 * Returns a list of Publicize connection service names that require reauthentication from users.
 * iFor example, when LinkedIn switched its API from v1 to v2.
 *
 * @param {Object} state State object.
 *
 * @return {Array} List of service names that need reauthentication.
 */
export function getMustReauthConnections( state ) {
	return state
		.filter( connection => 'must_reauth' === connection.test_success )
		.map( connection => connection.service_name );
}
