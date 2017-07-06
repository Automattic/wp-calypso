/**
 * External dependencies
 */
import { get, map } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { hydrateRevision, normalizeRevision } from 'state/selectors/utils/revisions';

const getPostRevisions = createSelector(
	( state, siteId, postId, normalizerName = null ) => map(
		get( state.posts.revisions.revisions, [ siteId, postId ], {} ),
		revision => normalizeRevision( normalizerName, hydrateRevision( state, revision ) )
	),
	( state ) => [ state.posts.revisions.revisions, state.users.items ]
);

export default getPostRevisions;
