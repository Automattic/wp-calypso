/**
 * External dependencies
 */
import get from 'lodash/get';
import createSelector from 'lib/create-selector';
import filter from 'lodash/filter';
import find from 'lodash/find';
import merge from 'lodash/merge';
import flow from 'lodash/flow';
import cloneDeep from 'lodash/cloneDeep';
import includes from 'lodash/includes';
import some from 'lodash/some';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';

/**
 * Internal dependencies
 */
import TreeConvert from 'lib/tree-convert';
import {
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getDeserializedPostsQueryDetails,
	getSerializedPostsQueryWithoutPage
} from './utils';
import { DEFAULT_POST_QUERY } from './constants';
import firstPassCanonicalImage from 'lib/post-normalizer/rule-first-pass-canonical-image';
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';
import stripHtml from 'lib/post-normalizer/rule-strip-html';

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
 * Returns a normalized post object by its global ID, or null if the post does
 * not exist. A normalized post includes common transformations to prepare the
 * post for display.
 *
 * @param  {Object}  state    Global state tree
 * @param  {String}  globalId Post global ID
 * @return {?Object}          Post object
 */
export const getNormalizedPost = createSelector(
	( () => {
		// Cache normalize flow in immediately-invoked closure to avoid
		// regenerating same flow on each call to this selector
		const normalize = flow( [
			firstPassCanonicalImage,
			decodeEntities,
			stripHtml
		] );

		return ( state, globalId ) => {
			const post = getPost( state, globalId );
			if ( ! post ) {
				return null;
			}

			return normalize( cloneDeep( post ) );
		};
	} )(),
	( state ) => state.posts.items
);

/**
 * Returns an array of post objects by site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site posts
 */
export const getSitePosts = createSelector(
	( state, siteId ) => filter( state.posts.items, { site_ID: siteId } ),
	( state ) => [ state.posts.items ]
);

/**
 * Returns a post object by site ID, post ID pair.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  postId Post ID
 * @return {?Object}        Post object
 */
export const getSitePost = createSelector(
	( state, siteId, postId ) => find( getSitePosts( state, siteId ), { ID: postId } ) || null,
	( state, siteId ) => getSitePosts( state, siteId )
);

/**
 * Returns an array of normalized posts for the posts query, or null if no
 * posts have been received.
 *
 * @see getNormalizedPost
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Array}         Posts for the post query
 */
export function getSitePostsForQuery( state, siteId, query ) {
	const manager = state.posts.queries[ siteId ];
	if ( ! manager ) {
		return null;
	}

	const posts = manager.getItems( query );
	if ( ! posts ) {
		return null;
	}

	// PostQueryManager is smart enough to return an array including undefined
	// entries if it knows that a page of results exists for the query (via a
	// previous request's `found` value) but the items haven't been received.
	// While we could impose this on the developer to accommodate, instead we
	// simply return null when any `undefined` entries exist in the set.
	if ( includes( posts, undefined ) ) {
		return null;
	}

	return posts.map( ( post ) => getNormalizedPost( state, post.global_ID ) );
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
	const serializedQuery = getSerializedPostsQuery( query, siteId );
	return !! state.posts.queryRequests[ serializedQuery ];
}

/**
 * Returns the total number of items reported to be found for the given query,
 * or null if the total number of queryable posts if unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Number}        Total number of found items
 */
export function getSitePostsFoundForQuery( state, siteId, query ) {
	if ( ! state.posts.queries[ siteId ] ) {
		return null;
	}

	return state.posts.queries[ siteId ].getFound( query );
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
	if ( ! state.posts.queries[ siteId ] ) {
		return null;
	}

	const pages = state.posts.queries[ siteId ].getNumberOfPages( query );
	if ( null === pages ) {
		return null;
	}

	return Math.max( pages, 1 );
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
 * Returns an array of normalized posts for the posts query, including all
 * known queried pages, or null if the posts for the query are not known.
 *
 * @see getNormalizedPost
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Array}         Posts for the post query
 */
export function getSitePostsForQueryIgnoringPage( state, siteId, query ) {
	const posts = state.posts.queries[ siteId ];
	if ( ! posts ) {
		return null;
	}

	const itemsIgnoringPage = posts.getItemsIgnoringPage( query );
	if ( ! itemsIgnoringPage ) {
		return null;
	}

	return itemsIgnoringPage.map( ( post ) => {
		return getNormalizedPost( state, post.global_ID );
	} );
}

/**
 * Returns true if currently requesting posts for the posts query, regardless
 * of page, or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {Boolean}        Whether posts are being requested
 */
export const isRequestingSitePostsForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const normalizedQueryWithoutPage = omit( getNormalizedPostsQuery( query ), 'page' );
		return some( state.posts.queryRequests, ( isRequesting, serializedQuery ) => {
			if ( ! isRequesting ) {
				return false;
			}

			const queryDetails = getDeserializedPostsQueryDetails( serializedQuery );
			if ( queryDetails.siteId !== siteId ) {
				return false;
			}

			return isEqual(
				normalizedQueryWithoutPage,
				omit( queryDetails.query, 'page' )
			);
		} );
	},
	( state ) => state.posts.queryRequests,
	( state, siteId, query ) => getSerializedPostsQuery( query, siteId )
);

/**
 * Returns an array of normalized posts for the posts query, including all
 * known queried pages, preserving hierarchy. Returns null if no posts have
 * been received. Hierarchy is represented by `parent` and `items` properties
 * on each post.
 *
 * @see getNormalizedPost
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

/**
 * Returns a post object by site ID post ID pairing, with editor revisions.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @return {Object}        Post object with revisions
 */
export function getEditedPost( state, siteId, postId ) {
	const post = getSitePost( state, siteId, postId );
	if ( ! state.posts.edits[ siteId ] ) {
		return post;
	}

	const edits = state.posts.edits[ siteId ][ postId || '' ];
	if ( ! postId ) {
		return edits || null;
	}

	return merge( {}, post, edits );
}

/**
 * Returns the assigned value for the edited post by field key.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @param  {String} field  Field value to retrieve
 * @return {*}             Field value
 */
export function getEditedPostValue( state, siteId, postId, field ) {
	return get( getEditedPost( state, siteId, postId ), field );
}
