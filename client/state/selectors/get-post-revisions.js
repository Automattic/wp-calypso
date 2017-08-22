/**
 * External dependencies
 */
import { get, map, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { hydrateRevision, normalizeRevision } from 'state/selectors/utils/revisions';

const getPostRevisions = createSelector(
	( state, siteId, postId, normalizerName = null ) => orderBy(
		map(
			get( state.posts.revisions.revisions, [ siteId, postId ], {} ),
			revision => normalizeRevision( normalizerName, hydrateRevision( state, revision ) )
		),
		'date',
		'desc'
	),
	( state ) => [ state.posts.revisions.revisions, state.users.items ]
);

export default getPostRevisions;
