/**
 * External dependencies
 */
import { get, map } from 'lodash';

/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';

import 'calypso/state/posts/init';

export const getPostRevisionsAuthorsId = createSelector(
	( state, siteId, postId ) => [
		...new Set(
			map( get( state.posts.revisions.diffs, [ siteId, postId, 'revisions' ], {} ), ( r ) =>
				parseInt( r.post_author, 10 )
			)
		),
	],
	( state ) => [ state.posts.revisions.diffs ]
);
