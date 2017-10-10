/**
 * External dependencies
 *
 * @format
 */
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import {
	HAPPYCHAT_GROUP_WPCOM,
	HAPPYCHAT_GROUP_JPOP,
	HAPPYCHAT_CHAT_STATUS_ABANDONED,
	HAPPYCHAT_CHAT_STATUS_ASSIGNED,
	HAPPYCHAT_CHAT_STATUS_BLOCKED,
	HAPPYCHAT_CHAT_STATUS_CLOSED,
	HAPPYCHAT_CHAT_STATUS_DEFAULT,
	HAPPYCHAT_CHAT_STATUS_NEW,
	HAPPYCHAT_CHAT_STATUS_MISSED,
	HAPPYCHAT_CHAT_STATUS_PENDING,
} from 'state/happychat/constants';
import { isEnabled } from 'config';
import { isJetpackSite, getSite } from 'state/sites/selectors';
import { isATEnabled } from 'lib/automated-transfer';
import { getSectionName } from 'state/ui/selectors';
import isHappychatClientConnected from 'state/happychat/selectors/is-happychat-client-connected';

// How much time needs to pass before we consider the session inactive:
const HAPPYCHAT_INACTIVE_TIMEOUT_MS = 1000 * 60 * 10;

/**
 * Grab the group or groups for happychat based on siteId
 * @param {object} state Current state
 * @param {int} siteId The site id, if no siteId is present primary siteId will be used
 * @returns {array} of groups for site Id
 */
export const getGroups = ( state, siteId ) => {
	const groups = [];

	// For Jetpack Connect we need to direct chat users to the JPOP group, to account for cases
	// when the user does not have a site yet, or their primary site is not a Jetpack site.
	if ( isEnabled( 'jetpack/happychat' ) && getSectionName( state ) === 'jetpackConnect' ) {
		groups.push( HAPPYCHAT_GROUP_JPOP );
		return groups;
	}

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

export const getHappychatChatStatus = createSelector( state => state.happychat.chatStatus );

export const getHappychatLastActivityTimestamp = state => state.happychat.lastActivityTimestamp;

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
