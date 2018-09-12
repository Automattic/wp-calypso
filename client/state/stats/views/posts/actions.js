/** @format */

/**
 * Internal dependencies
 */
import { STATS_VIEWS_POSTS_REQUEST, STATS_VIEWS_POSTS_RECEIVE } from 'state/action-types';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve views for a post or posts.
 *
 * @param  {Number}   siteId   Site ID
 * @param  {String}   postIds  Comma separated list of Post IDs
 * @param  {Number}   num      Number of days to include in the query
 * @param  {String}   date     The most recent day to include in results (YYYY-MM-DD format)
 * @return {Object}  Action object
 */
export function requestPostsViews( siteId, postIds, num, date ) {
	return {
		type: STATS_VIEWS_POSTS_REQUEST,
		siteId,
		postIds,
		num,
		date,
	};
}

/**
 * Returns an action object to be used in signalling that a post views object has
 * been received.
 *
 * @param  {Number}  siteId   Site ID
 * @return {Object}  Action object
 */
export function receivePostsViews( siteId, { date, posts } ) {
	return {
		type: STATS_VIEWS_POSTS_RECEIVE,
		siteId,
		date,
		posts,
	};
}
