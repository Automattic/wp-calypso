/**
 * External dependencies
 */
import { filter, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSitePosts } from 'state/posts/selectors/get-site-posts';

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
export { getPostPreviewUrl } from 'state/posts/selectors/get-post-preview-url';

export function getSitePostsByTerm( state, siteId, taxonomy, termId ) {
	return filter( getSitePosts( state, siteId ), post => {
		return (
			post.terms &&
			post.terms[ taxonomy ] &&
			find( post.terms[ taxonomy ], postTerm => postTerm.ID === termId )
		);
	} );
}
