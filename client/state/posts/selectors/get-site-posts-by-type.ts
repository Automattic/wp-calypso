import { createSelector } from '@automattic/state-utils';
import { getQueryManager } from './get-query-manager';
import type { AppState } from 'calypso/types';

import 'calypso/state/posts/init';

/**
 * Returns an array of post objects by site ID and post type.
 */
export const getSitePostsByType = createSelector(
	( state: AppState, siteId: number, type: string ) => {
		const queryManager = getQueryManager( state, siteId );

		if ( ! queryManager ) {
			return null;
		}

		return queryManager.getItems( { type } );
	},
	( state ) => state.posts.queries
);
