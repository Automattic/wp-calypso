/** @format **/

/**
 * Internal dependencies
 */
import { HAPPYCHAT_SET_CHAT_STATUS } from 'state/action-types';

export const setHappychatChatStatus = status => ( {
	type: HAPPYCHAT_SET_CHAT_STATUS,
	status,
} );
