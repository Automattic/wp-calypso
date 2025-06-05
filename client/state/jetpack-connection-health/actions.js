import wp from 'calypso/lib/wp';
import {
	JETPACK_CONNECTION_HEALTHY,
	JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	JETPACK_CONNECTION_UNHEALTHY,
	JETPACK_CONNECTION_HEALTH_REQUEST,
	JETPACK_CONNECTION_HEALTH_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/jetpack-connection-health/init';

/**
 * Sets the Jetpack connection status to healthy
 *
 * This action is called when the Jetpack health status API returns a healthy status.
 * @param {number} siteId The site id to which the status belongs
 * @returns {Object} An action object
 */
export const setJetpackConnectionHealthy = ( siteId ) => ( {
	type: JETPACK_CONNECTION_HEALTHY,
	siteId,
} );

/**
 * Sets the Jetpack connection status to unhealthy along with error code.
 *
 * This action is called when the Jetpack health status API returns a Jetpack error as defined in jetpack/connection-health/constants.js file.
 * @param {number} siteId The site id to which the status belongs
 * @param {string} errorCode The error code
 * @returns {Object} An action object
 */
export const setJetpackConnectionUnhealthy = ( siteId, errorCode ) => ( {
	type: JETPACK_CONNECTION_UNHEALTHY,
	siteId,
	errorCode,
} );

/**
 * Sets the Jetpack connection health status request failure message.
 *
 * This action is called when the Jetpack health status API fails to be reached.
 * @param {number} siteId The site id to which the status belongs
 * @param {string} error The error message
 * @returns {Object} An action object
 */
export const setJetpackConnectionRequestFailure = ( siteId, error ) => ( {
	type: JETPACK_CONNECTION_HEALTH_REQUEST_FAILURE,
	siteId,
	error,
} );

/**
 * Requests the Jetpack connection health status from the server
 *
 * This is called when the Jetpack connection is maybe unhealthy and we want to confirm
 * the status by calling the health status API.
 *
 * The jetpack health status API is expensive, we don't want to call it on every page load.
 * Instead, we call it only in case the other jetpack enpoints have failed (e.g. modules and JITM).
 * By setting the status to maybe unhealthy, we call the health status API to show the
 * error message in the UI.
 * It's called used in the JetpackConnectionHealthBanner component.
 * @param {number} siteId The site id to which the status belongs
 * @returns {Function} Action thunk
 */
export const requestJetpackConnectionHealthStatus = ( siteId ) => ( dispatch ) => {
	dispatch( {
		type: JETPACK_CONNECTION_HEALTH_REQUEST,
		siteId,
		lastRequestTime: Date.now(),
	} );

	return wp.req
		.get( {
			path: `/sites/${ siteId }/jetpack-connection-health`,
			apiNamespace: 'wpcom/v2',
		} )
		.then( ( response ) => {
			const { is_healthy, error } = response;
			if ( is_healthy ) {
				dispatch( setJetpackConnectionHealthy( siteId ) );
			} else {
				dispatch( setJetpackConnectionUnhealthy( siteId, error ) );
			}
		} )
		.catch( ( error ) => {
			dispatch( setJetpackConnectionRequestFailure( siteId, error.message ) );
		} );
};

/**
 * Sets the Jetpack connection status to maybe unhealthy
 *
 * The jetpack health status API is expensive, we don't want to call it on every page load.
 * Instead, we call it only in case the other jetpack enpoints have failed (e.g. modules and JITM).
 * By setting the status to maybe unhealthy, we call the health status API to show the
 * error message in the UI.
 * @param {number} siteId The site id to which the status belongs
 * @returns {Object} An action object
 */
export const setJetpackConnectionMaybeUnhealthy = ( siteId ) => ( {
	type: JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	siteId,
} );
