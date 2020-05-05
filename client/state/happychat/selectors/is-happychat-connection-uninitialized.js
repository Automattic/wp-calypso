/**
 * Internal dependencies
 */
import { HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED } from 'state/happychat/constants';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';

/**
 * Returns true if connection status is uninitialized
 *
 * @param {object} state - global redux state
 * @returns {boolean} Whether Happychat connection status is uninitialized
 */
export default function ( state ) {
	return getHappychatConnectionStatus( state ) === HAPPYCHAT_CONNECTION_STATUS_UNINITIALIZED;
}
