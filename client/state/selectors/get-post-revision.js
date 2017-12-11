/** @format */

/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getPostRevisions } from 'state/selectors';

const getPostRevision = createSelector(
	( state, siteId, postId, revisionId ) => {
		const revisions = getPostRevisions( state, siteId, postId );
		return find( revisions, { id: revisionId } ) || null;
	},
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevision;
