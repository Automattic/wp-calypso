/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

import 'state/posts/init';

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
	( state ) => state.posts.queries
);
