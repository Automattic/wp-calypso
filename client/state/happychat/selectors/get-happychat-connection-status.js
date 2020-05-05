/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the current happychat connection status
 *
 * @param {object} state - global redux state
 * @returns {string} current state value
 */
export default function ( state ) {
	return get( state, 'happychat.connection.status' );
}
