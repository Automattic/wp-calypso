/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { hydrateRevision } from 'state/selectors/utils/revisions';

const getPostRevision = createSelector(
	( state, siteId, postId, revisionId ) => hydrateRevision(
		state,
		get( state.posts.revisions.revisions, [ siteId, postId, revisionId ], null )
	),
	( state ) => [ state.posts.revisions.revisions, state.users.items ]
);

export default getPostRevision;
