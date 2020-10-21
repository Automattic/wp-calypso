/**
 * Internal dependencies
 */
import {
	STATS_RECENT_POST_VIEWS_REQUEST,
	STATS_RECENT_POST_VIEWS_RECEIVE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/stats/views/posts';

import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve views for a post or posts.
 *
 * @param  {number}   siteId   Site ID
 * @param  {string}   postIds  Comma separated list of Post IDs
 * @param  {number}   num      Number of days to include in the query
 * @param  {string}   date     The most recent day to include in results (YYYY-MM-DD format)
 * @returns {object}  Action object
 */
export function requestRecentPostViews( siteId, postIds, num, date ) {
	return {
		type: STATS_RECENT_POST_VIEWS_REQUEST,
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
 * @param  {number}  siteId   Site ID
 * @returns {object}  Action object
 */
export function receiveRecentPostViews( siteId, { date, posts } ) {
	return {
		type: STATS_RECENT_POST_VIEWS_RECEIVE,
		siteId,
		date,
		posts,
	};
}
