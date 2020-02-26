/**
 * External dependencies
 */
import { filter, find, has, get, includes, isEqual, omit, some } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import {
	getFeaturedImageId,
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
	getDeserializedPostsQueryDetails,
	getSerializedPostsQueryWithoutPage,
	isAuthorEqual,
	isDateEqual,
	isDiscussionEqual,
	areAllMetadataEditsApplied,
	applyPostEdits,
	mergePostEdits,
	normalizePostForEditing,
	normalizePostForDisplay,
} from 'state/posts/utils';
import { decodeURIIfValid } from 'lib/url';
import { getSite } from 'state/sites/selectors';
import { DEFAULT_POST_QUERY, DEFAULT_NEW_POST_VALUES } from 'state/posts/constants';
import { addQueryArgs } from 'lib/route';

import { getQueryManager } from 'state/posts/selectors/get-query-manager';
import { getPost } from 'state/posts/selectors/get-post';

import 'state/posts/init';

export { getPost } from 'state/posts/selectors/get-post';

/**
 * Returns a normalized post object by its global ID, or null if the post does
 * not exist. A normalized post includes common transformations to prepare the
 * post for display.
 *
 * @param   {object}  state    Global state tree
 * @param   {string}  globalId Post global ID
 * @returns {?object}          Post object
 */
export const getNormalizedPost = createSelector(
	( state, globalId ) => normalizePostForDisplay( getPost( state, globalId ) ),
	state => [ state.posts.items, state.posts.queries ]
);

/**
 * Returns an array of post objects by site ID.
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @returns {Array}         Site posts
 */
export const getSitePosts = createSelector(
	( state, siteId ) => {
		if ( ! siteId ) {
			return null;
		}

		const manager = state.posts.queries[ siteId ];
		if ( ! manager ) {
			return [];
		}

		return manager.getItems();
	},
	state => state.posts.queries
);

/**
 * Returns a post object by site ID, post ID pair.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {string}  postId Post ID
 * @returns {?object}        Post object
 */
export const getSitePost = createSelector(
	( state, siteId, postId ) => {
		if ( ! siteId ) {
			return null;
		}

		const manager = state.posts.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		return manager.getItem( postId );
	},
	state => state.posts.queries
);

/**
 * Returns an array of normalized posts for the posts query, or null if no
 * posts have been received.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {?Array}         Posts for the post query
 */
export const getPostsForQuery = createSelector(
	( state, siteId, query ) => {
		const manager = getQueryManager( state, siteId );
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
		//
		// TODO this is known to be incorrect behavior in some cases, because
		// the WP.com API skips unreadable posts entirely instead of including
		// them in the results.  See the 'handles items missing from the first
		// and last pages' test case for PaginatedQueryManager.
		if ( includes( posts, undefined ) ) {
			return null;
		}

		return posts.map( normalizePostForDisplay );
	},
	state => [ state.posts.queries, state.posts.allSitesQueries ],
	( state, siteId, query ) => getSerializedPostsQuery( query, siteId )
);

/**
 * Returns true if currently requesting posts for the posts query, or false
 * otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {boolean}        Whether posts are being requested
 */
export function isRequestingPostsForQuery( state, siteId, query ) {
	const serializedQuery = getSerializedPostsQuery( query, siteId );
	return !! state.posts.queryRequests[ serializedQuery ];
}

/**
 * Returns the total number of items reported to be found for the given query,
 * or null if the total number of queryable posts is unknown.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {?number}        Total number of found items
 */
export function getPostsFoundForQuery( state, siteId, query ) {
	const manager = getQueryManager( state, siteId );
	if ( ! manager ) {
		return null;
	}

	return manager.getFound( query );
}

/**
 * Returns the last queryable page of posts for the given query, or null if the
 * total number of queryable posts if unknown.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {?number}        Last posts page
 */
export function getPostsLastPageForQuery( state, siteId, query ) {
	const manager = getQueryManager( state, siteId );
	if ( ! manager ) {
		return null;
	}

	const pages = manager.getNumberOfPages( query );
	if ( null === pages ) {
		return null;
	}

	return Math.max( pages, 1 );
}

/**
 * Returns true if the query has reached the last page of queryable pages, or
 * null if the total number of queryable posts if unknown.
 *
 * @param   {object}   state  Global state tree
 * @param   {?number}  siteId Site ID, or `null` for all-sites queries
 * @param   {object}   query  Post query object
 * @returns {?boolean}        Whether last posts page has been reached
 */
export function isPostsLastPageForQuery( state, siteId, query = {} ) {
	const lastPage = getPostsLastPageForQuery( state, siteId, query );
	if ( null === lastPage ) {
		return lastPage;
	}

	return lastPage === ( query.page || DEFAULT_POST_QUERY.page );
}

/**
 * Returns an array of normalized posts for the posts query, including all
 * known queried pages, or null if the posts for the query are not known.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {?Array}         Posts for the post query
 */
export const getPostsForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const manager = getQueryManager( state, siteId );
		if ( ! manager ) {
			return null;
		}

		const itemsIgnoringPage = manager.getItemsIgnoringPage( query );
		if ( ! itemsIgnoringPage ) {
			return null;
		}

		return itemsIgnoringPage.map( normalizePostForDisplay );
	},
	state => [ state.posts.queries, state.posts.allSitesQueries ],
	( state, siteId, query ) => getSerializedPostsQueryWithoutPage( query, siteId )
);

/**
 * Returns true if currently requesting posts for the posts query, regardless
 * of page, or false otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {boolean}        Whether posts are being requested
 */
export const isRequestingPostsForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const normalizedQueryWithoutPage = omit( getNormalizedPostsQuery( query ), 'page' );
		return some( state.posts.queryRequests, ( isRequesting, serializedQuery ) => {
			if ( ! isRequesting ) {
				return false;
			}

			const queryDetails = getDeserializedPostsQueryDetails( serializedQuery );
			// Specific site query
			if ( queryDetails.siteId && queryDetails.siteId !== siteId ) {
				return false;
			}
			// All-sites query
			if ( ! queryDetails.siteId && siteId ) {
				return false;
			}

			return isEqual( normalizedQueryWithoutPage, omit( queryDetails.query, 'page' ) );
		} );
	},
	state => state.posts.queryRequests,
	( state, siteId, query ) => getSerializedPostsQuery( query, siteId )
);

/**
 * Returns true if a request is in progress for the specified site post, or
 * false otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Whether request is in progress
 */
export function isRequestingSitePost( state, siteId, postId ) {
	if ( ! siteId ) {
		return null;
	}

	if ( ! state.posts.siteRequests[ siteId ] ) {
		return false;
	}

	return !! state.posts.siteRequests[ siteId ][ postId ];
}

/**
 * Returns an object of edited post attributes for the site ID post ID pairing.
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @returns {object}        Post revisions
 */
export const getPostEdits = createSelector(
	( state, siteId, postId ) => {
		const postEditsLog = get( state.posts.edits, [ siteId, postId || '' ] );
		if ( ! postEditsLog ) {
			return null;
		}

		return normalizePostForEditing( mergePostEdits( ...postEditsLog ) );
	},
	state => [ state.posts.edits ]
);

/**
 * Returns a post object by site ID post ID pairing, with editor revisions.
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @returns {object}        Post object with revisions
 */
export const getEditedPost = createSelector(
	( state, siteId, postId ) => {
		const post = getSitePost( state, siteId, postId );
		const edits = getPostEdits( state, siteId, postId );
		if ( ! edits ) {
			return post;
		}

		return applyPostEdits( post, edits );
	},
	state => [ state.posts.queries, state.posts.edits ]
);

/**
 * Returns the assigned value for the edited post by field key.
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @param   {string} field  Field value to retrieve
 * @returns {*}             Field value
 */
export function getEditedPostValue( state, siteId, postId, field ) {
	return get( getEditedPost( state, siteId, postId ), field );
}

/**
 * Returns true if the edited post is password protected.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Result of the check
 */
export function isEditedPostPasswordProtected( state, siteId, postId ) {
	const password = getEditedPostValue( state, siteId, postId, 'password' );
	return !! ( password && password.length > 0 );
}

/**
 * Returns true if the edited post is password protected and has a valid password set
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Result of the check
 */
export function isEditedPostPasswordProtectedWithValidPassword( state, siteId, postId ) {
	const password = getEditedPostValue( state, siteId, postId, 'password' );
	return !! ( password && password.trim().length > 0 );
}

/**
 * Returns true if there are "dirty" edited fields to be saved for the post
 * corresponding with the site ID post ID pair, or false otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Whether dirty fields exist
 */
export const isEditedPostDirty = createSelector(
	( state, siteId, postId ) => {
		const post = getSitePost( state, siteId, postId );
		const edits = getPostEdits( state, siteId, postId );

		const editsDirty = some( edits, ( value, key ) => {
			if ( key === 'type' ) {
				return false;
			}

			if ( post ) {
				switch ( key ) {
					case 'author': {
						return ! isAuthorEqual( value, post.author );
					}
					case 'date': {
						return ! isDateEqual( value, post.date );
					}
					case 'discussion': {
						return ! isDiscussionEqual( value, post.discussion );
					}
					case 'featured_image': {
						return value !== getFeaturedImageId( post );
					}
					case 'metadata': {
						return ! areAllMetadataEditsApplied( value, post.metadata );
					}
					case 'parent': {
						return get( post, 'parent.ID', 0 ) !== value;
					}
				}
				return post[ key ] !== value;
			}

			return ! ( key in DEFAULT_NEW_POST_VALUES ) || value !== DEFAULT_NEW_POST_VALUES[ key ];
		} );

		const { initial, current } = state.ui.editor.rawContent;
		const rawContentDirty = initial !== current;
		return editsDirty || rawContentDirty;
	},
	state => [ state.posts.queries, state.posts.edits, state.ui.editor.rawContent ]
);

/**
 * Returns true if the post status is publish, private, or future
 * and the date is in the past
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Whether post is published
 */
export const isPostPublished = createSelector(
	( state, siteId, postId ) => {
		const post = getSitePost( state, siteId, postId );

		if ( ! post ) {
			return null;
		}

		return (
			includes( [ 'publish', 'private' ], post.status ) ||
			( post.status === 'future' && new Date( post.date ) < new Date() )
		);
	},
	state => state.posts.queries
);

/**
 * Returns the slug, or suggested_slug, for the edited post
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @returns {string}             Slug value
 */
export function getEditedPostSlug( state, siteId, postId ) {
	// if local edits exists, return them regardless of post status
	const postEdits = getPostEdits( state, siteId, postId );
	if ( has( postEdits, 'slug' ) ) {
		return postEdits.slug;
	}

	const post = getSitePost( state, siteId, postId );
	const postSlug = get( post, 'slug' );

	// when post is published, return the slug
	if ( isPostPublished( state, siteId, postId ) ) {
		return decodeURIIfValid( postSlug );
	}

	// only return suggested_slug if slug has not been edited
	const suggestedSlug = get( post, [ 'other_URLs', 'suggested_slug' ] );
	if ( suggestedSlug && ! postSlug ) {
		return suggestedSlug;
	}

	return postSlug;
}

/**
 * Returns the most reliable preview URL for the post by site ID, post ID pair,
 * or null if a preview URL cannot be determined.
 *
 * @param   {object}  state     Global state tree
 * @param   {number}  siteId    Site ID
 * @param   {number}  postId    Post ID
 * @param   {object}  [options] Special options. See wp-calypso#14456
 * @returns {?string}           Post preview URL
 */
export function getPostPreviewUrl( state, siteId, postId, options = false ) {
	const rawPost = options.__forceUseRawPost;
	const shouldUseRawPost = !! rawPost;

	const post = shouldUseRawPost ? rawPost : getSitePost( state, siteId, postId );

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
		previewUrl = addQueryArgs(
			{
				preview: true,
			},
			previewUrl
		);
	}

	// Support mapped domains https
	const site = getSite( state, siteId );
	if ( site && site.options ) {
		const { is_mapped_domain, unmapped_url } = site.options;
		previewUrl = is_mapped_domain ? previewUrl.replace( site.URL, unmapped_url ) : previewUrl;
	}

	return previewUrl;
}

export function getSitePostsByTerm( state, siteId, taxonomy, termId ) {
	return filter( getSitePosts( state, siteId ), post => {
		return (
			post.terms &&
			post.terms[ taxonomy ] &&
			find( post.terms[ taxonomy ], postTerm => postTerm.ID === termId )
		);
	} );
}
