/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

import 'state/posts/init';

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
	( state ) => state.posts.queries
);
