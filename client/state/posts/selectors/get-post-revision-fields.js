import { createSelector } from '@automattic/state-utils';
import { get } from 'lodash';

export const getPostRevisionFields = createSelector(
	( state, siteId, postId ) => {
		return get( state.posts.revisions.diffs, [ siteId, postId, 'revisionFields' ] );
	},
	( state ) => [ state.posts.revisions.diffs ]
);
