/**
 * External dependencies
 */
import { get, head, map } from 'lodash';

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

// If the page is refreshed within the below amount of time after
// any chat activity, Happychat will automatically reconnect.
export const HAPPYCHAT_INACTIVE_TIMEOUT_MS = 1000 * 60 * 10;

export const getHappychatChatStatus = createSelector(
	state => state.happychat.chatStatus
);

export const getHappychatTranscriptTimestamp = state => (
	state.happychat.transcript_timestamp || get( head( state.happychat.timeline ), 'timestamp' )
);

export const getHappychatLastActivity = state => state.happychat.lastActivity;

export const isHappychatRecentlyActive = ( state, now ) => {
	const lastActive = getHappychatLastActivity( state );
	if ( lastActive > now ) {
		return false;
	}

	return ( now - lastActive ) < HAPPYCHAT_INACTIVE_TIMEOUT_MS;
};

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

/**
 * Gets the current chat session status
 * @param {Object} state - global redux state
 * @return {String} status of the current chat session
 */
export const getHappychatStatus = createSelector(
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

export const getHappychatMessage = createSelector(
	state => get( state, [ 'happychat', 'message' ] )
);
