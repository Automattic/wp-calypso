/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

import 'state/posts/init';

const getPostRevision = createSelector(
	( state, siteId, postId, revisionId ) =>
		get( state.posts.revisions.diffs, [ siteId, postId, 'revisions', revisionId ], null ),
	( state ) => [ state.posts.revisions.diffs ]
);

export default getPostRevision;
