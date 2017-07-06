/**
 * External dependencies
 */
import { findIndex, get, isUndefined, map, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { diffWords } from 'lib/text-utils';
import getPostRevisions from 'state/selectors/get-post-revisions';

const getPostRevisionChanges = createSelector(
	( state, siteId, postId, revisionId ) => {
		const orderedRevisions = getPostRevisions( state, siteId, postId );
		const revisionIndex = findIndex( orderedRevisions, { id: revisionId } );
		if ( revisionIndex === -1 ) {
			return [];
		}
		return map(
			diffWords(
				get( orderedRevisions, [ revisionIndex + 1, 'content' ], '' ),
				orderedRevisions[ revisionIndex ].content
			),
			change => omitBy( change, isUndefined )
		);
	},
	( state ) => [ state.posts.revisions.revisions ],
);

export default getPostRevisionChanges;
