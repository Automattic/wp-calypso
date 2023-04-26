import { get } from 'lodash';

import 'calypso/state/happychat/init';

/**
 * Gets the current happychat connection status
 *
 * @param {Object} state - global redux state
 * @returns {string} current state value
 */
export default function ( state ) {
	return get( state, 'happychat.connection.status' );
}
