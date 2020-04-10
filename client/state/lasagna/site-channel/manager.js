/**
 * External Dependencies
 */
import moment from 'moment-timezone';
import createDebug from 'debug';

/**
 * Internal dependencies
 */
import { getViewingSiteIds } from 'state/reader/viewing/selectors';
import { channelLeave, CHANNELS } from 'state/lasagna/channel';
import { isPrivateSite } from 'state/reader/sites/selectors';

/**
 * Module variables
 */
export const namespace = 'site';
const MAX_SECONDS_KEEP_CHANNEL_ACTIVE = 60 * 60; // 1 hour
const MAX_SECONDS_SINCE_LAST_UPDATE = 60 * 45; // 45 minutes
const MAX_CHANNELS_OPEN = 20;
const debug = createDebug( 'lasagna:manager:site' );
const publicChannelTopicPrefix = `public:push:${ namespace }:`;
const privateChannelTopicPrefix = `private:push:${ namespace }:`;

/**
 * Get the channel topic
 *
 * @param {object} store redux store
 * @param {string} siteId the Id of the site
 * @returns {string|boolean} topic string
 */
export function getChannelTopic( store, siteId ) {
	const isPrivate = isPrivateSite( store.getState(), siteId );
	if ( isPrivate === null ) {
		// we don't have the site yet
		return false;
	}

	if ( isPrivate ) {
		return privateChannelTopicPrefix + siteId;
	}

	return publicChannelTopicPrefix + siteId;
}

/**
 * Leave channels that are stale
 *
 * @param store redux store
 */
export function leaveStaleChannels( store ) {
	const state = store.getState();
	const channels = CHANNELS[ namespace ] || {};
	const viewingSiteIds = getViewingSiteIds( state );

	let oldestChannel = Number.MAX_INT;
	let oldestTopic = null;
	for ( const topic in channels ) {
		if ( ! channels.hasOwnProperty( topic ) ) {
			continue;
		}

		const channel = channels[ topic ];

		if ( viewingSiteIds.includes( channel.meta.siteId ) ) {
			continue;
		}

		if ( channel.updatedAt < oldestChannel ) {
			oldestChannel = channel.updatedAt;
			oldestTopic = topic;
		}

		const now = moment().unix();
		if ( now - channel.updatedAt > MAX_SECONDS_SINCE_LAST_UPDATE ) {
			debug( topic, 'remove stale channel' );
			channelLeave( { store, namespace, topic } );
		}
	}

	if ( Object.keys( channels ).length === MAX_CHANNELS_OPEN - 1 && oldestTopic ) {
		debug( oldestTopic, 'almost full, remove oldest topic' );
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

	if ( ! topic ) {
		debug( topic, 'cannot join, topic missing' );
		return false;
	}

	if ( channels[ topic ] ) {
		debug( topic, 'cannot join already joined' );
		return false;
	}

	if ( Object.keys( channels ).length >= MAX_CHANNELS_OPEN ) {
		debug( topic, 'cannot join maximum open channels reached' );
		return false;
	}

	debug( topic, 'can join' );
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
	const viewingSiteIds = getViewingSiteIds( state );

	if ( ! topic ) {
		debug( topic, 'cannot leave, topic missing' );
		return false;
	}

	if ( Object.keys( channels ).length === 0 ) {
		debug( topic, 'cannot leave, channels still loading or already left' );
		return false;
	}

	if ( ! channels[ topic ] ) {
		debug( topic, 'cannot leave, channel not found' );
		return false;
	}
	const channel = channels[ topic ];
	const siteId = channel.meta.siteId;

	if ( viewingSiteIds.includes( siteId ) ) {
		debug( topic, 'cannot leave currently viewing' );
		return false;
	}

	const now = moment().unix();
	if ( now - channel.joinedAt < MAX_SECONDS_KEEP_CHANNEL_ACTIVE ) {
		debug( topic, 'cannot leave, channel still active' );
		return false;
	}

	debug( topic, 'can leave' );
	return true;
}
