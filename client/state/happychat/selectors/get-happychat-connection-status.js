/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the current happychat connection status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export default function( state ) {
	return get( state, 'happychat.connection.status' );
}
