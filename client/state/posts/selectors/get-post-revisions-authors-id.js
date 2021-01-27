/**
 * External dependencies
 */
import { get, map, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from '@automattic/create-selector';

import 'calypso/state/posts/init';

export const getPostRevisionsAuthorsId = createSelector(
	( state, siteId, postId ) =>
		uniq(
			map( get( state.posts.revisions.diffs, [ siteId, postId, 'revisions' ], {} ), ( r ) =>
				parseInt( r.post_author, 10 )
			)
		),
	( state ) => [ state.posts.revisions.diffs ]
);
