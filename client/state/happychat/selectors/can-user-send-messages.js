import {
	HAPPYCHAT_CHAT_STATUS_ABANDONED,
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_MISSED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from 'calypso/state/happychat/constants';
import getHappychatChatStatus from './get-happychat-chat-status';
import isHappychatClientConnected from './is-happychat-client-connected';

const CHAT_STATUSES = [
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_PENDING,
	HAPPYCHAT_CHAT_STATUS_MISSED,
	HAPPYCHAT_CHAT_STATUS_ABANDONED,
];

/**
 * Returns true if the user should be able to send messages to operators based on
 * chat status. For example new chats and ongoing chats should be able to send messages,
 * but blocked or pending chats should not.
 *
 * @param {Object} state - global redux state
 * @returns {boolean} Whether the user is able to send messages
 */
const canUserSendMessages = ( state ) =>
	isHappychatClientConnected( state ) &&
	! CHAT_STATUSES.includes( getHappychatChatStatus( state ) );

export default canUserSendMessages;
