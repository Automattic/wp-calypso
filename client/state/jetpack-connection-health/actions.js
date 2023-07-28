import { JETPACK_CONNECTION_MAYBE_UNHEALTHY } from 'calypso/state/action-types';

import 'calypso/state/jetpack-connection-health/init';

/**
 * Sets the Jetpack connection status to maybe unhealthy
 *
 * @param {number} siteId The site id to which the status belongs
 * @returns {Object} An action object
 */
export const setJetpackConnectionMaybeUnhealthy = ( siteId ) => ( {
	type: JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	siteId,
} );
