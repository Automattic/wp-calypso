import { get } from 'lodash';
import isHappychatClientConnected from 'calypso/state/happychat/selectors/is-happychat-client-connected';

import 'calypso/state/happychat/init';

/**
 * Returns true if Happychat client is connected and server is available to take new localized chats
 *
 * @param {Object} state - global redux state
 * @returns {boolean} Whether new localized chats can be taken by matching operators
 */
export default function ( state ) {
	return (
		isHappychatClientConnected( state ) && get( state, 'happychat.connection.localizedSupport' )
	);
}
