/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

const getPendingRevisionsCount = createSelector(
	( state, siteId, postId ) =>
		get( state.posts.revisions.diffs, [ siteId, postId, 'pending', 'count' ], 0 ),
	state => [ state.posts.revisions.diffs ]
);

export default getPendingRevisionsCount;
