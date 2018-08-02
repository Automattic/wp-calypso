/**
 * External dependencies
 */
import { getSerializedTopPostsQuery } from './utils';

/**
 * Returns true if current requesting top posts for the specified site ID,
 * period and date, or false otherwise.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {Object}  query   Top posts query
 * @return {Boolean}         Whether the top posts are being requested
 */
export function isRequestingTopPosts( state, siteId, query = {} ) {
	const serializedQuery = getSerializedTopPostsQuery( query, siteId );
	return state.stats.topPosts.requesting[ serializedQuery ] || false;
}

/**
 * Returns the top posts for the specified period and date.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @param  {Object}  query   Top posts query
 * @return {Object}          Top posts
 */
export function getTopPosts( state, siteId, query = {} ) {
	const serializedQuery = getSerializedTopPostsQuery( query, siteId );
	return state.stats.topPosts.items[ serializedQuery ] || null;
}
