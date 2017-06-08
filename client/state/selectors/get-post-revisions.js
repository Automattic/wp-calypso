/**
 * External dependencies
 */
import { get, map, partial } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { hydrateRevision } from 'state/selectors/utils/revisions';

const getPostRevisions = createSelector(
	( state, siteId, postId ) => map(
		get( state.posts.revisions.revisions, [ siteId, postId ], {} ),
		partial( hydrateRevision, state )
	),
	( state ) => [ state.posts.revisions.revisions, state.users.items ]
);

export default getPostRevisions;
