/** @format */

/**
 * External dependencies
 */

import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getPostRevisions from 'state/selectors/get-post-revisions';

const getPostRevisionChanges = createSelector(
	( state, siteId, postId, revisionId ) => {
		const orderedRevisions = getPostRevisions( state, siteId, postId, 'display' );
		const revisionIndex = findIndex( orderedRevisions, { id: revisionId } );
		if ( revisionIndex === -1 ) {
			return { content: [], title: [] };
		}
		return orderedRevisions[ revisionIndex ].changes;
	},
	state => [ state.posts.revisions.revisions ]
);

export default getPostRevisionChanges;
