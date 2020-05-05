/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_CHAT_STATUS_ABANDONED,
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_MISSED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from 'state/happychat/constants';

import getHappychatChatStatus from 'state/happychat/selectors/get-happychat-chat-status';
import isHappychatClientConnected from 'state/happychat/selectors/is-happychat-client-connected';

/**
 * Returns true if the user should be able to send messages to operators based on
 * chat status. For example new chats and ongoing chats should be able to send messages,
 * but blocked or pending chats should not.
 *
 * @param {object} state - global redux state
 * @returns {boolean} Whether the user is able to send messages
 */
export default ( state ) =>
	isHappychatClientConnected( state ) &&
	! includes(
		[
			HAPPYCHAT_CHAT_STATUS_BLOCKED,
			HAPPYCHAT_CHAT_STATUS_DEFAULT,
			HAPPYCHAT_CHAT_STATUS_PENDING,
			HAPPYCHAT_CHAT_STATUS_MISSED,
			HAPPYCHAT_CHAT_STATUS_ABANDONED,
		],
		getHappychatChatStatus( state )
	);
