/** @format */

/**
 * External dependencies
 */

import { findIndex, get, isUndefined, map, reduce, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { countDiffWords, diffWords } from 'lib/text-utils';
import getPostRevisions from 'state/selectors/get-post-revisions';

const MAX_DIFF_CONTENT_LENGTH = 10000;

const diffKey = ( key, obj1, obj2 ) =>
	map( diffWords( get( obj1, key, '' ), get( obj2, key, '' ) ), change =>
		omitBy( change, isUndefined )
	);

const getCombinedLength = list =>
	reduce(
		list,
		( sum, r ) => ( sum += get( r, 'title.length', 0 ) + get( r, 'content.length', 0 ) ),
		0
	);

const getPostRevisionChanges = createSelector(
	( state, siteId, postId, revisionId ) => {
		const orderedRevisions = getPostRevisions( state, siteId, postId, 'display' );
		const revisionIndex = findIndex( orderedRevisions, { id: revisionId } );
		if ( revisionIndex === -1 ) {
			return { content: [], summary: [], title: [] };
		}

		const revision = orderedRevisions[ revisionIndex ];
		const previousRevision = get( orderedRevisions, [ revisionIndex + 1 ], {} );
		const combinedLength = getCombinedLength( [ previousRevision, revision ] );

		if ( combinedLength > MAX_DIFF_CONTENT_LENGTH ) {
			return { content: [], summary: [], title: [], tooLong: true };
		}
		const title = diffKey( 'title', previousRevision, revision );
		const content = diffKey( 'content', previousRevision, revision );
		const summary = countDiffWords( title.concat( content ) );

		return {
			content,
			summary,
			title,
		};
	},
	state => [ state.posts.revisions.revisions ]
);

export default getPostRevisionChanges;
