import {
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_CLOSED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_NEW,
} from 'calypso/state/happychat/constants';

import 'calypso/state/happychat/init';

const INACTIVE_CHAT_STATUSES = [
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_CLOSED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_NEW,
];

/**
 * Returns true if there's an active chat session in-progress. Chat sessions with
 * the status `new`, `default`, or `closed` are considered inactive, as the session
 * is not connected to an operator.
 *
 * @param {Object} state - global redux state
 * @returns {boolean} Whether there's an active Happychat session happening
 */
export default function hasActiveHappychatSession( state ) {
	return ! INACTIVE_CHAT_STATUSES.includes( state.happychat.chat.status );
}
