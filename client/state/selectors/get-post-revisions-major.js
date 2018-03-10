/** @format */

/**
 * External dependencies
 */
import { filter, get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getPostRevisions, getPostRevisionsComparisons } from 'state/selectors';

const getPostRevisionsMajor = createSelector(
	( state, siteId, postId ) => {
		const revisions = getPostRevisions( state, siteId, postId );
		const comparisons = getPostRevisionsComparisons( state, siteId, postId );

		const majorRevisions = filter( revisions, revision => {
			const totals = get( comparisons, [ revision.id, 'diff', 'totals' ] );
			return ! isEmpty( totals );
		} );

		return majorRevisions;
	},
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevisionsMajor;
