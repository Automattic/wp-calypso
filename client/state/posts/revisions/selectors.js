/**
 * External dependencies
 */
import { get, map } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import { normalizePostForDisplay } from '../utils';

export const getNormalizedPostRevisions = createSelector(
	( state, siteId, postId ) => {
		const normalizedRevisions = map(
			get( state.posts.revisions.revisions, [ siteId, postId ], [] ),
			normalizePostForDisplay
		);
		return normalizedRevisions;
	},
	( state ) => [ state.posts.revisions.revisions ]
);

export const getNormalizedPostRevision = createSelector(
	( state, siteId, postId, revisionId ) => {
		return normalizePostForDisplay(
			get( state.posts.revisions.revisions, [ siteId, postId, revisionId ] )
		);
	},
	( state ) => [ state.posts.revisions.revisions ]
);
