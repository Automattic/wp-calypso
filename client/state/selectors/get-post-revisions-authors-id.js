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
		uniq( map( get( state.posts.revisions.revisions, [ siteId, postId ], {} ), 'author' ) ),
	state => [ state.posts.revisions.revisions ]
);

export default getPostRevisionsAuthorsId;
