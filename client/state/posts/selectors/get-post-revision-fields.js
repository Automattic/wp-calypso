import { createSelector } from '@automattic/state-utils';

export const getPostRevisionFields = createSelector(
	( state, siteId, postId ) => {
		return state.posts.revisions.diffs?.[ siteId ]?.[ postId ]?.revisionFields;
	},
	( state ) => [ state.posts.revisions.diffs ]
);
