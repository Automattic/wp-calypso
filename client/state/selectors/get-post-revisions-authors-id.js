/** @format */

/**
 * External dependencies
 */

import { get, map, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

const getPostRevisionsAuthorsId = createSelector(
	( state, siteId, postId ) =>
		uniq(
			map( get( state.posts.revisions.diffs, [ siteId, postId, 'revisions' ], {} ), 'post_author' )
		),
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevisionsAuthorsId;
