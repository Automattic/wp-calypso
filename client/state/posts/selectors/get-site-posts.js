import { createSelector } from '@automattic/state-utils';

import 'calypso/state/posts/init';

/**
 * Returns an array of post objects by site ID.
 *
 * @param   {Object} state  Global state tree
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
