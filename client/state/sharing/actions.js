/**
 * Internal dependencies
 */
import { CONNECTIONS_SET_EXPANDED_SERVICE } from 'calypso/state/action-types';

import 'calypso/state/sharing/init';

/**
 * Triggers a network request for a user's connected services.
 *
 * @param {string} serviceName name of the service to expand.
 * @returns {Function} Action thunk
 */
export function setExpandedService( serviceName ) {
	return ( dispatch ) => {
		dispatch( {
			type: CONNECTIONS_SET_EXPANDED_SERVICE,
			serviceName,
		} );
	};
}
