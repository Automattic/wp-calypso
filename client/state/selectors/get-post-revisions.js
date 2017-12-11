/** @format */

/**
 * External dependencies
 */

import { get, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

const getPostRevisions = createSelector(
	( state, siteId, postId ) =>
		orderBy(
			get( state.posts.revisions.diffs, [ siteId, postId, 'revisions' ], {} ),
			'date',
			'desc'
		),
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevisions;
