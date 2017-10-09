/** @format **/
/**
 * Internal dependencies
 */
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';

/**
 * Returns true if connection status is connected
 * @param {Object} state - global redux state
 * @return {Boolean} Whether Happychat connection status is connected
 */
export default function( state ) {
	return getHappychatConnectionStatus( state ) === 'connected';
}
