/**
 * Internal dependencies
 */
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that post stat for a site,
 * post and stat have been received.
 *
 * @param  {String} stat   Stat Key
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post Id
 * @param  {Number} value  The stat value
 * @return {Object}        Action object
 */
export function receivePostStat( stat, siteId, postId, value ) {
	return {
		type: POST_STATS_RECEIVE,
		stat,
		siteId,
		postId,
		value
	};
}

/**
 * Action creator to request a post stat
 *
 * @param  {String} stat   Stat Key
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post Id
 * @return {Object}        Action object
 */
export function requestPostStat( stat, siteId, postId ) {
	return {
		type: POST_STATS_REQUEST,
		stat,
		postId,
		siteId
	};
}
