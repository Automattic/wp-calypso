/**
 * External dependencies
 */
import { filter, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import { addQueryArgs } from 'lib/route';

import { getSitePosts } from 'state/posts/selectors/get-site-posts';
import { getSitePost } from 'state/posts/selectors/get-site-post';

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
export { isEditedPostPasswordProtected } from 'state/posts/selectors/is-edited-post-password-protected';
export { isEditedPostPasswordProtectedWithValidPassword } from 'state/posts/selectors/is-edited-post-password-protected-with-valid-password';
export { isEditedPostDirty } from 'state/posts/selectors/is-edited-post-dirty';
export { isPostPublished } from 'state/posts/selectors/is-post-published';
export { getEditedPostSlug } from 'state/posts/selectors/get-edited-post-slug';

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
