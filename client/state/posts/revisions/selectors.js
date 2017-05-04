/**
 * External dependencies
 */
import { get, identity, map, partial } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import { normalizePostForDisplay } from '../utils';

export const normalizeForDisplay = normalizePostForDisplay;
export const normalizeForEditing = identity;

function hydrateRevision( state, revision ) {
	if ( ! revision ) {
		return revision;
	}

	const author = get( state.users.items, revision.author );
	if ( ! author ) {
		return revision;
	}

	return {
		...revision,
		...{ author }
	};
}

export const getPostRevisions = createSelector(
	( state, siteId, postId ) => map(
		get( state.posts.revisions.revisions, [ siteId, postId ], {} ),
		partial( hydrateRevision, state )
	),
	( state ) => [ state.posts.revisions.revisions, state.users.items ]
);

export const getPostRevision = createSelector(
	( state, siteId, postId, revisionId ) => hydrateRevision(
		state,
		get( state.posts.revisions.revisions, [ siteId, postId, revisionId ], null )
	),
	( state ) => [ state.posts.revisions.revisions, state.users.items ]
);
