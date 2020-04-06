/**
 * External Dependencies
 */
import createDebug from 'debug';

/**
 * Module variables
 */
export const namespace = 'user';
const debug = createDebug( 'lasagna:manager:user' );
const channelTopicPrefix = `${ namespace }:wpcom:`;

/**
 * Get the channel topic
 *
 * @param {number} userId Id of the user
 * @returns {string|boolean} topic string or false
 */
export function getChannelTopic( userId ) {
	if ( ! userId ) {
		return false;
	}
	return channelTopicPrefix + userId;
}

/**
 * Check if channel topic can be joined
 *
 * @param store redux store
 * @param topic channel topic
 * @returns {boolean} whether or not the channel can be joined
 */
export function canJoinChannel( store, topic ) {
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
	debug( topic, 'can leave' );
	return true;
}
