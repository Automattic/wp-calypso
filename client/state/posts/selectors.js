/**
 * External dependencies
 */
import get from 'lodash/get';
import createSelector from 'lib/create-selector';
import find from 'lodash/find';
import includes from 'lodash/includes';
import some from 'lodash/some';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';

/**
 * Internal dependencies
 */
import {
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getDeserializedPostsQueryDetails,
	getSerializedPostsQueryWithoutPage,
	mergeIgnoringArrays,
	normalizePostForEditing,
	normalizePostForDisplay
} from './utils';
import { DEFAULT_POST_QUERY, DEFAULT_NEW_POST_VALUES } from './constants';
import addQueryArgs from 'lib/route/add-query-args';

/**
 * Returns a post object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Post global ID
 * @return {Object}          Post object
 */
export function getPost( state, globalId ) {
	const path = state.posts.items[ globalId ];
	if ( ! path ) {
		return null;
	}

	const [ siteId, postId ] = path;
	const manager = state.posts.queries[ siteId ];
	if ( ! manager ) {
		return null;
	}

	return manager.getItem( postId );
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
	( state, globalId ) => normalizePostForDisplay( getPost( state, globalId ) ),
	( state ) => [ state.posts.items, state.posts.queries ]
);

/**
 * Returns an array of post objects by site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site posts
 */
export const getSitePosts = createSelector(
	( state, siteId ) => {
		const manager = state.posts.queries[ siteId ];
		if ( ! manager ) {
			return [];
		}

		return manager.getItems();
	},
	( state ) => state.posts.queries
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
	( state, siteId, postId ) => {
		const manager = state.posts.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		return manager.getItem( postId );
	},
	( state ) => state.posts.queries
);

/**
 * Returns an array of normalized posts for the posts query, or null if no
 * posts have been received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Array}         Posts for the post query
 */
export const getSitePostsForQuery = createSelector(
	( state, siteId, query ) => {
		const manager = state.posts.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		const posts = manager.getItems( query );
		if ( ! posts ) {
			return null;
		}

		// PostQueryManager will return an array including undefined entries if
		// it knows that a page of results exists for the query (via a previous
		// request's `found` value) but the items haven't been received. While
		// we could impose this on the developer to accommodate, instead we
		// simply return null when any `undefined` entries exist in the set.
		if ( includes( posts, undefined ) ) {
			return null;
		}

		return posts.map( normalizePostForDisplay );
	},
	( state ) => state.posts.queries,
	( state, siteId, query ) => getSerializedPostsQuery( query, siteId )
);

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
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Array}         Posts for the post query
 */
export const getSitePostsForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const posts = state.posts.queries[ siteId ];
		if ( ! posts ) {
			return null;
		}

		const itemsIgnoringPage = posts.getItemsIgnoringPage( query );
		if ( ! itemsIgnoringPage ) {
			return null;
		}

		return itemsIgnoringPage.map( normalizePostForDisplay );
	},
	( state ) => state.posts.queries,
	( state, siteId, query ) => getSerializedPostsQueryWithoutPage( query, siteId )
);

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
	const edits = getPostEdits( state, siteId, postId );
	if ( ! edits ) {
		return post;
	}

	if ( ! post ) {
		return edits;
	}

	return mergeIgnoringArrays( {}, post, edits );
}

/**
 * Returns an object of edited post attributes for the site ID post ID pairing.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @return {Object}        Post revisions
 */
export function getPostEdits( state, siteId, postId ) {
	const { edits } = state.posts;
	return normalizePostForEditing( get( edits, [ siteId, postId || '' ], null ) );
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

/**
 * Returns true if there are "dirty" edited fields to be saved for the post
 * corresponding with the site ID post ID pair, or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post ID
 * @return {Boolean}        Whether dirty fields exist
 */
export const isEditedPostDirty = createSelector(
	( state, siteId, postId ) => {
		const post = getSitePost( state, siteId, postId );
		const edits = getPostEdits( state, siteId, postId );

		return some( edits, ( value, key ) => {
			if ( key === 'type' ) {
				return false;
			}

			if ( post ) {
				return post[ key ] !== value;
			}

			return (
				! DEFAULT_NEW_POST_VALUES.hasOwnProperty( key ) ||
				value !== DEFAULT_NEW_POST_VALUES[ key ]
			);
		} );
	},
	( state ) => [ state.posts.items, state.posts.edits ]
);

/**
 * Returns the most reliable preview URL for the post by site ID, post ID pair,
 * or null if a preview URL cannot be determined.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post ID
 * @return {?String}        Post preview URL
 */
export function getPostPreviewUrl( state, siteId, postId ) {
	const post = getSitePost( state, siteId, postId );
	if ( ! post ) {
		return null;
	}

	const { URL: url, status } = post;
	if ( ! url || status === 'trash' ) {
		return null;
	}

	if ( post.preview_URL ) {
		return post.preview_URL;
	}

	let previewUrl = url;
	if ( 'publish' !== status ) {
		previewUrl = addQueryArgs( {
			preview: true
		}, previewUrl );
	}

	return previewUrl;
}
