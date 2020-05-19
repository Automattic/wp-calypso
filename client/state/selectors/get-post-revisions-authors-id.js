/**
 * External dependencies
 */
import { get, map, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

import 'state/posts/init';

const getPostRevisionsAuthorsId = createSelector(
	( state, siteId, postId ) =>
		uniq(
			map( get( state.posts.revisions.diffs, [ siteId, postId, 'revisions' ], {} ), ( r ) =>
				parseInt( r.post_author, 10 )
			)
		),
	( state ) => [ state.posts.revisions.diffs ]
);

export default getPostRevisionsAuthorsId;
