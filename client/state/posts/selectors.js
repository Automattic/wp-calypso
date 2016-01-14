/**
 * External dependencies
 */
import range from 'lodash/utility/range';

/**
 * Internal dependencies
 */
import {
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getSerializedPostsQueryWithoutPage
} from './utils';

/**
 * Returns a post object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Post global ID
 * @return {Object}          Post object
 */
export function getPost( state, globalId ) {
	return state.posts.items[ globalId ];
}

/**
 * Returns a post object by site ID, post ID pair.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  postId Post ID
 * @return {?Object}        Post object
 */
export function getSitePost( state, siteId, postId ) {
	const { sitePosts } = state.posts;
	if ( ! sitePosts[ siteId ] || ! sitePosts[ siteId ][ postId ] ) {
		return null;
	}

	return getPost( state, sitePosts[ siteId ][ postId ] );
}

/**
 * Returns true if the specified posts query is being tracked for the site, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {Boolean}        Whether posts query is tracked for site
 */
export function isTrackingSitePostsQuery( state, siteId, query ) {
	const { siteQueries } = state.posts;
	if ( ! siteQueries[ siteId ] ) {
		return false;
	}

	return !! siteQueries[ siteId ][ getSerializedPostsQuery( query ) ];
}

/**
 * Returns an array of posts for the posts query, or null if no posts have been
 * received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Array}         Posts for the post query
 */
export function getSitePostsForQuery( state, siteId, query ) {
	const { siteQueries } = state.posts;
	if ( ! isTrackingSitePostsQuery( state, siteId, query ) ) {
		return null;
	}

	query = getSerializedPostsQuery( query );
	if ( ! siteQueries[ siteId ][ query ].posts ) {
		return null;
	}

	return siteQueries[ siteId ][ query ].posts.map( ( globalId ) => {
		return getPost( state, globalId );
	} );
}

/**
 * Returns true if currently requesting posts for the posts query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {Boolean}        Whether posts are being requested
 */
export function isRequestingSitePostsForQuery( state, siteId, query ) {
	if ( ! isTrackingSitePostsQuery( state, siteId, query ) ) {
		return false;
	}

	query = getSerializedPostsQuery( query );
	return state.posts.siteQueries[ siteId ][ query ].fetching;
}

/**
 * Returns the last queryable page of posts for the given query, or null if the
 * total number of queryable posts if unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Number}        Last posts page
 */
export function getSitePostsLastPageForQuery( state, siteId, query ) {
	const { siteQueriesLastPage } = state.posts;
	if ( ! siteQueriesLastPage[ siteId ] ) {
		return null;
	}

	const serializedQuery = getSerializedPostsQueryWithoutPage( query );
	return siteQueriesLastPage[ siteId ][ serializedQuery ] || null;
}

/**
 * Returns true if the query has reached the last page of queryable pages, or
 * null if the total number of queryable posts if unknown.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @param  {Object}   query  Post query object
 * @return {?Boolean}        Whether last posts page has been reached
 */
export function isSitePostsLastPageForQuery( state, siteId, query = {} ) {
	const lastPage = getSitePostsLastPageForQuery( state, siteId, query );
	if ( null === lastPage ) {
		return lastPage;
	}

	return lastPage === getNormalizedPostsQuery( query ).page;
}

/**
 * Returns an array of posts for the posts query, including all known
 * queried pages, or null if the number of pages is unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Array}         Posts for the post query
 */
export function getSitePostsForQueryIgnoringPage( state, siteId, query ) {
	const lastPage = getSitePostsLastPageForQuery( state, siteId, query );
	if ( null === lastPage ) {
		return lastPage;
	}

	return range( 1, lastPage + 1 ).reduce( ( memo, page ) => {
		const pageQuery = Object.assign( {}, query, { page } );
		return memo.concat( getSitePostsForQuery( state, siteId, pageQuery ) || [] );
	}, [] );
}
