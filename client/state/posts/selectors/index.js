/**
 * External dependencies
 */
import { filter, find, has, get, includes, some } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import {
	getFeaturedImageId,
	isAuthorEqual,
	isDateEqual,
	isDiscussionEqual,
	areAllMetadataEditsApplied,
} from 'state/posts/utils';
import { decodeURIIfValid } from 'lib/url';
import { getSite } from 'state/sites/selectors';
import { DEFAULT_NEW_POST_VALUES } from 'state/posts/constants';
import { addQueryArgs } from 'lib/route';

import { getSitePosts } from 'state/posts/selectors/get-site-posts';
import { getSitePost } from 'state/posts/selectors/get-site-post';
import { getPostEdits } from 'state/posts/selectors/get-post-edits';
import { getEditedPostValue } from 'state/posts/selectors/get-edited-post-value';

import 'state/posts/init';

export { getPost } from 'state/posts/selectors/get-post';
export { getNormalizedPost } from 'state/posts/selectors/get-normalized-post';
export { getSitePosts } from 'state/posts/selectors/get-site-posts';
export { getSitePost } from 'state/posts/selectors/get-site-post';
export { getPostsForQuery } from 'state/posts/selectors/get-posts-for-query';
export { isRequestingPostsForQuery } from 'state/posts/selectors/is-requesting-posts-for-query';
export { getPostsFoundForQuery } from 'state/posts/selectors/get-posts-found-for-query';
export { getPostsLastPageForQuery } from 'state/posts/selectors/get-posts-last-page-for-query';
export { isPostsLastPageForQuery } from 'state/posts/selectors/is-posts-last-page-for-query';
export { getPostsForQueryIgnoringPage } from 'state/posts/selectors/get-posts-for-query-ignoring-page';
export { isRequestingPostsForQueryIgnoringPage } from 'state/posts/selectors/is-requesting-posts-for-query-ignoring-page';
export { isRequestingSitePost } from 'state/posts/selectors/is-requesting-site-post';
export { getPostEdits } from 'state/posts/selectors/get-post-edits';
export { getEditedPost } from 'state/posts/selectors/get-edited-post';
export { getEditedPostValue } from 'state/posts/selectors/get-edited-post-value';

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
