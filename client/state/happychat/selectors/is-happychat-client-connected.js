/** @format **/
/**
 * Internal dependencies
 */
import getHappychatConnectionStatus from 'state/happychat/selectors/get-happychat-connection-status';

export default function isConnected( state ) {
	return getHappychatConnectionStatus( state ) === 'connected';
}
