/**
 * External dependencies
 */
import { get, map } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import { normalizePostForDisplay } from '../utils';

export const getPostRevisions = createSelector(
	( state, siteId, postId ) => {
		return map(
			get( state.posts.revisions.revisions, [ siteId, postId ], [] ),
			normalizePostForDisplay );
	},
	( state ) => [ state.posts.revisions.revisions ]
);
