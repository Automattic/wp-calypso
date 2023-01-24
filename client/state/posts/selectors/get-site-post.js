import { createSelector } from '@automattic/state-utils';

import 'calypso/state/posts/init';

/**
 * Returns a post object by site ID, post ID pair.
 *
 * @param   {Object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {string}  postId Post ID
 * @returns {?Object}        Post object
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
	( state ) => state.posts.queries
);
