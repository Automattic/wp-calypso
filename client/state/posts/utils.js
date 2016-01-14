/**
 * External dependencies
 */
import omit from 'lodash/object/omit';

/**
 * Module variables
 */
const DEFAULT_POSTS_PER_PAGE = 20;

/**
 * Returns a normalized posts query, notably including a default page and posts
 * per page values if either is not specified.
 *
 * @param  {Object} query Posts query
 * @return {Object}       Normalized posts query
 */
export function getNormalizedPostsQuery( query ) {
	return Object.assign( {
		page: 1,
		posts_per_page: DEFAULT_POSTS_PER_PAGE
	}, query );
}

/**
 * Returns a serialized posts query, used as the key in the
 * `state.posts.siteQueries` state object.
 *
 * @param  {Object} query Posts query
 * @return {String}       Serialized posts query
 */
export function getSerializedPostsQuery( query = {} ) {
	return JSON.stringify( getNormalizedPostsQuery( query ) );
}

/**
 * Returns a serialized posts query, excluding any page parameter, used as the
 * key in the `state.posts.siteQueriesLastPage` state object.
 *
 * @param  {Object} query Posts query
 * @return {String}       Serialized posts query
 */
export function getSerializedPostsQueryWithoutPage( query ) {
	return JSON.stringify( omit( getNormalizedPostsQuery( query ), 'page' ) );
}
