/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { default as createSelector } from 'lib/create-selector';
import { getPostRevisions, getPostRevisionsDiff } from 'state/selectors';

const getPostRevisionsComparisons = createSelector(
	( state, siteId, postId ) => {
		const revisions = getPostRevisions( state, siteId, postId );

		const comparisons = {};
		for ( let i = 0; i < revisions.length; i++ ) {
			const revisionId = get( revisions, [ i, 'id' ], 0 );
			const nextRevisionId = revisionId && get( revisions, [ i - 1, 'id' ] );
			const prevRevisionId = revisionId && get( revisions, [ i + 1, 'id' ] );

			comparisons[ revisionId ] = {
				diff: getPostRevisionsDiff( state, siteId, postId, prevRevisionId, revisionId ),
				nextRevisionId,
				prevRevisionId,
			};
		}
		return comparisons;
	},
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevisionsComparisons;
