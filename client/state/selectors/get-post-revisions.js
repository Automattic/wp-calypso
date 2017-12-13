/** @format */

/**
 * External dependencies
 */

import { get, orderBy, values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

const getPostRevisions = createSelector(
	( state, siteId, postId ) => {
		return orderBy(
			values( get( state.posts.revisions.diffs, [ siteId, postId, 'revisions' ], {} ) ),
			'post_modified_gmt',
			'desc'
		);
	},
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevisions;
