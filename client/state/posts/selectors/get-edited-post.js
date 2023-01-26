import { createSelector } from '@automattic/state-utils';
import { getPostEdits } from 'calypso/state/posts/selectors/get-post-edits';
import { getSitePost } from 'calypso/state/posts/selectors/get-site-post';
import { applyPostEdits } from 'calypso/state/posts/utils';

import 'calypso/state/posts/init';

/**
 * Returns a post object by site ID post ID pairing, with editor revisions.
 *
 * @param   {Object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @returns {Object}        Post object with revisions
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
	( state ) => [ state.posts.queries, state.posts.edits ]
);
