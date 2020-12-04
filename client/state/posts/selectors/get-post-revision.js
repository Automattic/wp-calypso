/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';

import 'calypso/state/posts/init';

export const getPostRevision = createSelector(
	( state, siteId, postId, revisionId ) =>
		get( state.posts.revisions.diffs, [ siteId, postId, 'revisions', revisionId ], null ),
	( state ) => [ state.posts.revisions.diffs ]
);
