/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSitePost } from 'state/posts/selectors/get-site-post';

import 'state/posts/init';

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
	( state ) => state.posts.queries
);
