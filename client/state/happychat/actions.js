/** @format **/

/**
 * Internal dependencies
 */
import { HAPPYCHAT_SET_CHAT_STATUS, HAPPYCHAT_SET_MESSAGE } from 'state/action-types';

export const setHappychatChatStatus = status => ( {
	type: HAPPYCHAT_SET_CHAT_STATUS,
	status,
} );

export const setChatMessage = message => ( { type: HAPPYCHAT_SET_MESSAGE, message } );
