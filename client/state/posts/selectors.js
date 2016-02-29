/**
 * External dependencies
 */
import range from 'lodash/range';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import TreeConvert from 'lib/tree-convert';
import {
	getSerializedPostsQuery,
	getSerializedPostsQueryWithoutPage
} from './utils';
import { DEFAULT_POST_QUERY } from './constants';

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
 * Returns an array of posts for the posts query, including all known queried
 * pages, preserving hierarchy. Returns null if no posts have been received.
 * Hierarchy is represented by `parent` and `items` properties on each post.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Object} query  Post query object
 * @return {?Array}        Hierarchical posts for the post query
 */
export const getSitePostsHierarchyForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		let sitePosts = getSitePostsForQueryIgnoringPage( state, siteId, query );
		if ( ! sitePosts ) {
			return sitePosts;
		}

		// For each site post object, add `parent` and `order` properties.
		// These are used by the TreeConvert library to build the hierarchy.
		const treeReadySitePosts = sitePosts.map( ( post, i ) => {
			return Object.assign( {}, post, {
				parent: post.parent ? post.parent.ID : 0,
				order: i
			} );
		} );

		return ( new TreeConvert( 'ID' ) ).treeify( treeReadySitePosts );
	},
	( state ) => [ state.posts.queries ],
	( state, siteId, query ) => getSerializedPostsQueryWithoutPage( query, siteId )
);

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
