/**
 * Internal dependencies
 */
import { HAPPYCHAT_CONNECTION_STATUS_CONNECTED } from 'state/happychat/constants';
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';

/**
 * Returns true if connection status is connected
 *
 * @param {object} state - global redux state
 * @returns {boolean} Whether Happychat connection status is connected
 */
export default function ( state ) {
	return getHappychatConnectionStatus( state ) === HAPPYCHAT_CONNECTION_STATUS_CONNECTED;
}
