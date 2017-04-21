/**
 * External dependencies
 */
import {
	get,
	head,
	includes,
	last,
	map,
} from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import {
	HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT
} from './constants';

// How much time needs to pass before we consider the session inactive:
const HAPPYCHAT_INACTIVE_TIMEOUT_MS = 1000 * 60 * 10;

export const HAPPYCHAT_CHAT_STATUS_DEFAULT = 'default';
export const HAPPYCHAT_CHAT_STATUS_ASSIGNED = 'assigned';
export const HAPPYCHAT_CHAT_STATUS_ASSIGNING = 'assigning';
export const HAPPYCHAT_CHAT_STATUS_PENDING = 'pending';
export const HAPPYCHAT_CHAT_STATUS_MISSED = 'missed';
export const HAPPYCHAT_CHAT_STATUS_ABANDONED = 'abandoned';
export const HAPPYCHAT_CHAT_STATUS_CLOSED = 'closed';

export const getHappychatChatStatus = createSelector(
	state => state.happychat.chatStatus
);

export const getHappychatTranscriptTimestamp = state => (
	state.happychat.transcript_timestamp || get( head( state.happychat.timeline ), 'timestamp' )
);

/**
 * Gets the current happychat connection status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export const getHappychatConnectionStatus = createSelector(
	state => state.happychat.connectionStatus
);

export const isHappychatConnectionUninitialized = state => getHappychatConnectionStatus( state ) === 'uninitialized';

export const isHappychatClientConnected = state => getHappychatConnectionStatus( state ) === 'connected';

export const isHappychatChatAssigned = createSelector(
	state => state.happychat.chatStatus === HAPPYCHAT_CHAT_STATUS_ASSIGNED
);

export const isHappychatAcceptingChats = createSelector(
	state => state.happychat.isAvailable
);

export const isHappychatChatActive = createSelector(
	state => ! includes( [ HAPPYCHAT_CHAT_STATUS_DEFAULT ], state.happychat.chatStatus ) && isHappychatAcceptingChats( state ),
	state => state.happychat.chatStatus
);

export const isHappychatServerReachable = createSelector(
	state => state.happychat.connectionError !== HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT
);

/**
 * Gets the current chat session status
 * @param {Object} state - global redux state
 * @return {String} status of the current chat session
 */
export const getHappychatStatus = createSelector(
	state => state.happychat.chatStatus
);

export const isHappychatAvailable = createSelector(
	state => isHappychatAcceptingChats( state ) || isHappychatChatActive( state ),
	[ isHappychatAcceptingChats, isHappychatChatActive ]
);

/**
 * Gets timeline chat events from the happychat state
 * @param {Object} state - Global redux state
 * @return [{Object}] events - an array of timeline chat events
 */
export const getHappychatTimeline = createSelector(
	state => state.happychat.timeline,
	state => map( state.happychat.timeline, 'id' )
);

export const canUserSendMessages = createSelector(
	state => (
		getHappychatConnectionStatus( state ) === 'connected' &&
		! includes(
			[	HAPPYCHAT_CHAT_STATUS_PENDING, HAPPYCHAT_CHAT_STATUS_MISSED,
				HAPPYCHAT_CHAT_STATUS_ABANDONED ],
			getHappychatChatStatus( state )
		) && isHappychatAcceptingChats( state )
	),
	[ getHappychatConnectionStatus, getHappychatChatStatus ]
);

export const getHappychatLastActivityTimestamp = state => state.happychat.lastActivityTimestamp;

export const wasHappychatRecentlyActive = state => {
	const lastActive = getHappychatLastActivityTimestamp( state );
	const now = Date.now();

	return ( now - lastActive ) < HAPPYCHAT_INACTIVE_TIMEOUT_MS;
};

export const getLostFocusTimestamp = createSelector(
	state => state.happychat.lostFocusAt
);

export const hasUnreadMessages = createSelector(
	state => {
		const lastMessageTimestamp = get( last( getHappychatTimeline( state ) ), 'timestamp' );
		const lostFocusAt = getLostFocusTimestamp( state );

		return (
			typeof lastMessageTimestamp === 'number' &&
			typeof lostFocusAt === 'number' &&
			// Message timestamps are reported in seconds. We need to multiply by 1000 to convert
			// to milliseconds, so we can compare it to other JS-generated timestamps
			lastMessageTimestamp * 1000 >= lostFocusAt
		);
	},
	[ getHappychatTimeline, getLostFocusTimestamp ]
);
