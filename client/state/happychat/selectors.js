/** @format */
/**
 * External dependencies
 */
import { get, includes, last, map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import {
	HAPPYCHAT_GROUP_WPCOM,
	HAPPYCHAT_GROUP_JPOP,
	HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT,
} from './constants';
import { isJetpackSite, getSite } from 'state/sites/selectors';
import { isATEnabled } from 'lib/automated-transfer';

// How much time needs to pass before we consider the session inactive:
const HAPPYCHAT_INACTIVE_TIMEOUT_MS = 1000 * 60 * 10;

export const HAPPYCHAT_CHAT_STATUS_ABANDONED = 'abandoned';
export const HAPPYCHAT_CHAT_STATUS_ASSIGNED = 'assigned';
export const HAPPYCHAT_CHAT_STATUS_ASSIGNING = 'assigning';
export const HAPPYCHAT_CHAT_STATUS_BLOCKED = 'blocked';
export const HAPPYCHAT_CHAT_STATUS_CLOSED = 'closed';
export const HAPPYCHAT_CHAT_STATUS_DEFAULT = 'default';
export const HAPPYCHAT_CHAT_STATUS_NEW = 'new';
export const HAPPYCHAT_CHAT_STATUS_MISSED = 'missed';
export const HAPPYCHAT_CHAT_STATUS_PENDING = 'pending';

/**
 * Grab the group or groups for happychat based on siteId
 * @param {object} state Current state
 * @param {int} siteId The site id, if no siteId is present primary siteId will be used
 * @returns {array} of groups for site Id
 */
export const getGroups = ( state, siteId ) => {
	const groups = [];
	const siteDetails = getSite( state, siteId );

	if ( isATEnabled( siteDetails ) ) {
		// AT sites should go to WP.com even though they are jetpack also
		groups.push( HAPPYCHAT_GROUP_WPCOM );
	} else if ( isJetpackSite( state, siteId ) ) {
		groups.push( HAPPYCHAT_GROUP_JPOP );
	} else {
		groups.push( HAPPYCHAT_GROUP_WPCOM );
	}
	return groups;
};

/**
 * Returns the geo location of the current user, based happychat session initiation (on ip)
 *
 * @param  {Object}  state  Global state tree
 * @return {?String}        Current user geo location
 */
export function getGeoLocation( state ) {
	return state.happychat.geoLocation || null;
}

export const getHappychatChatStatus = createSelector( state => state.happychat.chatStatus );

export const getHappychatLastActivityTimestamp = state => state.happychat.lastActivityTimestamp;

/**
 * Gets the current happychat connection status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export const getHappychatConnectionStatus = createSelector( state =>
	get( state, 'happychat.connectionStatus' )
);

export const isHappychatConnectionUninitialized = state =>
	getHappychatConnectionStatus( state ) === 'uninitialized';

export const isHappychatClientConnected = state =>
	getHappychatConnectionStatus( state ) === 'connected';

export const isHappychatChatAssigned = createSelector(
	state => get( state, 'happychat.chatStatus' ) === HAPPYCHAT_CHAT_STATUS_ASSIGNED
);

/**
 * Returns true if there's an active chat session in-progress. Chat sessions with
 * the status `new`, `default`, or `closed` are considered inactive, as the session
 * is not connected to an operator.
 * @param {Object} state - global redux state
 * @return {Boolean} Whether there's an active Happychat session happening
 */
export const hasActiveHappychatSession = createSelector(
	state =>
		! includes(
			[
				HAPPYCHAT_CHAT_STATUS_BLOCKED,
				HAPPYCHAT_CHAT_STATUS_CLOSED,
				HAPPYCHAT_CHAT_STATUS_DEFAULT,
				HAPPYCHAT_CHAT_STATUS_NEW,
			],
			state.happychat.chatStatus
		),
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
export const getHappychatStatus = createSelector( state => state.happychat.chatStatus );

/**
 * Returns true if Happychat is available to take new chats.
 * @param {Object} state - global redux state
 * @return {Boolean} Whether Happychat is available for new chats
 */
export const isHappychatAvailable = state =>
	isHappychatClientConnected( state ) && state.happychat.isAvailable;

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
 * Returns true if the user should be able to send messages to operators based on
 * chat status. For example new chats and ongoing chats should be able to send messages,
 * but blocked or pending chats should not.
 * @param {Object} state - global redux state
 * @return {Boolean} Whether the user is able to send messages
 */
export const canUserSendMessages = state =>
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

export const wasHappychatRecentlyActive = state => {
	const lastActive = getHappychatLastActivityTimestamp( state );
	const now = Date.now();

	return now - lastActive < HAPPYCHAT_INACTIVE_TIMEOUT_MS;
};

export const getLostFocusTimestamp = createSelector( state => state.happychat.lostFocusAt );

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
