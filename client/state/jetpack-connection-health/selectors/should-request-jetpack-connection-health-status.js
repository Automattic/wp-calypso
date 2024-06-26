import 'calypso/state/jetpack-connection-health/init';
import getJetpackConnectionHealthLastRequestTime from 'calypso/state/jetpack-connection-health/selectors/get-jetpack-connection-health-last-request-time';
import getJetpackConnectionHealth from './get-jetpack-connection-health';
import isJetpackConnectionProblem from './is-jetpack-connection-problem';

export const STALE_CONNECTION_HEALTH_THRESHOLD = 1000 * 60 * 5; // 5 minutes
export const STALE_CONNECTION_HEALTH_THRESHOLD_SHORT = 1000 * 15; // 15 seconds

/**
 * Returns true if the current site Jetpack site connection health status should be requested
 *
 * We want to request the Jetpack connection health status if:
 * - Either lastRequestTime is falsy or the time elapsed since lastRequestTime is greater than the threshold.
 * - There is a Jetpack connection health problem for the given siteId.
 * @param  {Object}  state        Global state tree
 * @param  {number}  siteId       Site ID
 * @returns {boolean}             Whether the current site should request Jetpack connection health status
 */
export const shouldRequestJetpackConnectionHealthStatus = ( state, siteId ) => {
	const lastRequestTime = getJetpackConnectionHealthLastRequestTime( state, siteId );
	const connectionHealth = getJetpackConnectionHealth( state, siteId );
	const threshold = connectionHealth?.error
		? STALE_CONNECTION_HEALTH_THRESHOLD_SHORT
		: STALE_CONNECTION_HEALTH_THRESHOLD;
	return (
		( ! lastRequestTime || Date.now() - lastRequestTime > threshold ) &&
		isJetpackConnectionProblem( state, siteId )
	);
};
