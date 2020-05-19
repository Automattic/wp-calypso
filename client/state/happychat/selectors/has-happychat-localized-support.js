/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import isHappychatClientConnected from 'state/happychat/selectors/is-happychat-client-connected';

/**
 * Returns true if Happychat client is connected and server is available to take new localized chats
 *
 * @param {object} state - global redux state
 * @returns {boolean} Whether new localized chats can be taken by matching operators
 */
export default function ( state ) {
	return (
		isHappychatClientConnected( state ) && get( state, 'happychat.connection.localizedSupport' )
	);
}
