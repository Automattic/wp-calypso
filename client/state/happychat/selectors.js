/**
 * External dependencies
 */
import { map, head, get, findLast } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

export const HAPPYCHAT_CHAT_STATUS_DEFAULT = 'default';
export const HAPPYCHAT_CHAT_STATUS_ASSIGNED = 'assigned';
export const HAPPYCHAT_CHAT_STATUS_ASSIGNING = 'assigning';
export const HAPPYCHAT_CHAT_STATUS_PENDING = 'pending';
export const HAPPYCHAT_CHAT_STATUS_MISSED = 'missed';
export const HAPPYCHAT_CHAT_STATUS_ABANDONED = 'abandoned';

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

export const isHappychatChatActive = createSelector(
	state => state.happychat.chatStatus !== HAPPYCHAT_CHAT_STATUS_DEFAULT,
	state => state.happychat.chatStatus
);

export const isHappychatAcceptingChats = createSelector(
	state => state.happychat.isAvailable
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

/**
 * Gets the last event in the timeline which does not belong to the specified user.
 * Used for detecting new messages that weren't sent from the active user.
 * @param {Object} state - Global redux state
 * @param {integer} excludeUserId - The user ID to exclude
 * @return {Object} event - The timeline event
 */
export const lastMessageExcludingUser = createSelector(
	( state, excludeUserId ) => findLast(
		getHappychatTimeline( state ),
		m => m.user_id !== excludeUserId
	),
	[ getHappychatTimeline ]
);
