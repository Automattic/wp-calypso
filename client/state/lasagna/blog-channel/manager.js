/**
 * External Dependencies
 */
import moment from 'moment-timezone';
import createDebug from 'debug';

/**
 * Internal dependencies
 */
import { getViewingBlogIds } from 'state/reader/sites/selectors';
import { channelLeave, CHANNELS } from 'state/lasagna/socket';

/**
 * Module variables
 */
export const namespace = 'blog';
const MAX_SECONDS_KEEP_CHANNEL_ACTIVE = 60 * 15; // 15 minutes
const MAX_SECONDS_SINCE_LAST_UPDATE = 60 * 15; // 15 minutes
const MAX_CHANNELS_OPEN = 3;
const debug = createDebug( 'lasagna:socket' );
const channelTopicPrefix = `public:push:${ namespace }:`;

/**
 * Get the channel topic
 *
 * @param action redux action
 * @returns {string|boolean} topic string or false
 */
export function getChannelTopic( action ) {
	if ( ! action.payload ) {
		return false;
	}

	if ( ! action.payload.post ) {
		return false;
	}
	return channelTopicPrefix + action.payload.post.site_ID;
}

/**
 * Leave channels that are stale
 *
 * @param store redux store
 */
export function leaveStaleChannels( store ) {
	debug( 'leave stale channels' );
	const state = store.getState();
	const channels = CHANNELS[ namespace ] || {};
	const viewingBlogIds = getViewingBlogIds( state );

	let oldestChannel = Number.MAX_INT;
	let oldestTopic = null;
	for ( const topic in channels ) {
		if ( ! channels.hasOwnProperty( topic ) ) {
			continue;
		}

		const channel = channels[ topic ];

		if ( viewingBlogIds.includes( channel.meta.blogId ) ) {
			continue;
		}

		if ( channel.updatedAt < oldestChannel ) {
			oldestChannel = channel.updatedAt;
			oldestTopic = topic;
		}

		const now = moment().unix();
		if ( now - channel.updatedAt > MAX_SECONDS_SINCE_LAST_UPDATE ) {
			debug( 'remove stale channel', topic );
			channelLeave( { store, namespace, topic } );
		}
	}

	if ( Object.keys( channels ).length === MAX_CHANNELS_OPEN - 1 && oldestTopic ) {
		debug( 'almost full, remove oldest topic', oldestTopic );
		channelLeave( { store, namespace, oldestTopic } );
	}
}

/**
 * Check if channel topic can be joined
 *
 * @param store redux store
 * @param topic channel topic
 * @returns {boolean} whether or not the channel can be joined
 */
export function canJoinChannel( store, topic ) {
	const channels = CHANNELS[ namespace ] || {};

	if ( channels[ topic ] ) {
		debug( 'cannot join already joined', topic );
		return false;
	}

	if ( Object.keys( channels ).length >= MAX_CHANNELS_OPEN ) {
		debug( 'cannot join maximum open channels reached', topic );
		return false;
	}

	debug( 'can join', topic );
	return true;
}

/**
 * Check if channel topic can be left
 *
 * @param store redux store
 * @param topic channel topic
 * @returns {boolean} whether or not the channel can be joined
 */
export function canLeaveChannel( store, topic ) {
	const state = store.getState();
	const channels = CHANNELS[ namespace ] || {};
	const viewingBlogIds = getViewingBlogIds( state );

	if ( Object.keys( channels ).length === 0 ) {
		debug( 'cannot leave, channels still loading', topic );
		return false;
	}

	if ( ! channels[ topic ] ) {
		debug( 'cannot leave, channels not found', topic );
		return false;
	}
	const channel = channels[ topic ];
	const blogId = channel.meta.blogId;

	if ( viewingBlogIds.includes( blogId ) ) {
		debug( 'cannot leave currently viewing', topic );
		return false;
	}

	const now = moment().unix();
	if ( now - channel.joinedAt < MAX_SECONDS_KEEP_CHANNEL_ACTIVE ) {
		debug( 'cannot leave, channel still active', topic );
		return false;
	}

	debug( 'can leave', topic );
	return true;
}
