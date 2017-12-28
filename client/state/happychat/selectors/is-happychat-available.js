/** @format **/
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import isHappychatClientConnected from 'client/state/happychat/selectors/is-happychat-client-connected';

/**
 * Returns true if Happychat client is connected and server is available to take new chats
 * @param {Object} state - global redux state
 * @return {Boolean} Whether new chats can be taken
 */
export default function( state ) {
	return isHappychatClientConnected( state ) && get( state, 'happychat.connection.isAvailable' );
}
