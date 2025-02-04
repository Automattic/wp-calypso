import 'calypso/state/jetpack-connection-health/init';
import getJetpackConnectionHealth from './get-jetpack-connection-health';

/**
 * Returns true if the current site Jetpack connection was checked and is unhealthy
 * @param  {Object}  state         Global state tree
 * @param  {number}  siteId        Site ID
 * @returns {boolean}             Whether the current site can have connection problem
 */
export default function isJetpackConnectionUnhealthy( state, siteId ) {
	const siteConnectionHealth = getJetpackConnectionHealth( state, siteId );

	if ( ! siteConnectionHealth ) {
		return false;
	}

	return (
		true === siteConnectionHealth.jetpack_connection_problem &&
		Boolean( siteConnectionHealth.error )
	);
}
