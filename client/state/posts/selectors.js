/**
 * External dependencies
 */
import range from 'lodash/range';
import keyBy from 'lodash/keyBy';
import { createSelector } from 'reselect';

/**
 * Internal dependencies
 */
import {
	getSerializedPostsQuery,
	getSerializedPostsQueryWithoutPage
} from './utils';
import { DEFAULT_POST_QUERY } from './constants';

/**
 * Returns all posts indexed by globalId
 *
 * @param  {Object} state    Global state tree
 * @return {Object}          Posts object
 */
export const getPostsByGlobalId = createSelector( getPosts, ( posts ) => {
	return keyBy( posts, 'global_ID' );
} );

/**
 * Returns a post object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Post global ID
 * @return {Object}          Post object
 */
export function getPost( state, globalId ) {
	return getPostsByGlobalId( state )[ globalId ];
}

/**
 * Returns an array of all posts.
 *
 * @param  {Object} state    Global state tree
 * @return {Array}           Posts array
 */
export function getPosts( state ) {
	return state.posts.items;
}

/**
 * Returns a mapping of site ID, post ID pairing to global post ID.
 *
 * @param state
 */
export const getSitePosts = createSelector(
	getPosts,
	( posts ) => {
		const sitePosts = {};
		posts.forEach( ( post ) => {
			if ( ! sitePosts[ post.site_ID ] ) {
				sitePosts[ post.site_ID ] = {};
			}

			sitePosts[ post.site_ID ][ post.ID ] = post.global_ID;
		} );
		return sitePosts;
	}
);

/**
 * Returns a post object by site ID, post ID pair.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  postId Post ID
 * @return {?Object}        Post object
 */
export function getSitePost( state, siteId, postId ) {
	const sitePosts = getSitePosts( state );
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
	return !! state.posts.queries[ getSerializedPostsQuery( query, siteId ) ];
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
	if ( ! isTrackingSitePostsQuery( state, siteId, query ) ) {
		return null;
	}

	const serializedQuery = getSerializedPostsQuery( query, siteId );
	if ( ! state.posts.queries[ serializedQuery ].posts ) {
		return null;
	}

	return state.posts.queries[ serializedQuery ].posts.map( ( globalId ) => {
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

	const serializedQuery = getSerializedPostsQuery( query, siteId );
	return state.posts.queries[ serializedQuery ].fetching;
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
	const serializedQuery = getSerializedPostsQueryWithoutPage( query, siteId );
	return state.posts.queriesLastPage[ serializedQuery ] || null;
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

	return lastPage === ( query.page || DEFAULT_POST_QUERY.page );
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

/**
 * Returns true if a request is in progress for the specified site post, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post ID
 * @return {Boolean}        Whether request is in progress
 */
export function isRequestingSitePost( state, siteId, postId ) {
	if ( ! state.posts.siteRequests[ siteId ] ) {
		return false;
	}

	return !! state.posts.siteRequests[ siteId ][ postId ];
}
