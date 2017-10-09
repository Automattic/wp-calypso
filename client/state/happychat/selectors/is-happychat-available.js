/** @format **/
/**
 * Internal dependencies
 */
import isHappychatClientConnected from 'state/happychat/selectors/is-happychat-client-connected';

/**
 * Returns true if Happychat is available to take new chats.
 * @param {Object} state - global redux state
 * @return {Boolean} Whether Happychat is available for new chats
 */
export default function( state ) {
	return isHappychatClientConnected( state ) && state.happychat.connection.isAvailable;
}
