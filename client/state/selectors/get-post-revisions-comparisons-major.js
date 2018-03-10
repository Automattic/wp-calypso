/** @format */

/**
 * External dependencies
 */
import { forEach, get, isEmpty, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getPostRevisionsMajor, getPostRevisionsComparisons } from 'state/selectors';

const getPostRevisionsComparisonsMajor = createSelector(
	( state, siteId, postId ) => {
		const majorRevisions = getPostRevisionsMajor( state, siteId, postId );
		const comparisons = getPostRevisionsComparisons( state, siteId, postId );

		const majorComparisons = pickBy( comparisons, comparison => {
			const totals = get( comparison, [ 'diff', 'totals' ] );
			return ! isEmpty( totals );
		} );

		forEach( majorRevisions, ( revision, i ) => {
			if ( ! revision.id ) {
				return;
			}
			majorComparisons[ revision.id ].nextRevisionId = get( majorRevisions, [ i - 1, 'id' ] );
			majorComparisons[ revision.id ].prevRevisionId = get( majorRevisions, [ i + 1, 'id' ] );
		} );

		return majorComparisons;
	},
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevisionsComparisonsMajor;
