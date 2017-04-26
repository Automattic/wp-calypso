/**
 * External dependencies
 */
import { get, identity, values } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import { normalizePostForDisplay } from '../utils';

export const normalizeForDisplay = normalizePostForDisplay;
export const normalizeForEditing = identity;

export const getPostRevisions = createSelector(
	( state, siteId, postId ) => values( get(
		state.posts.revisions.revisions,
		[ siteId, postId ],
		[]
	) ),
	( state ) => [ state.posts.revisions.revisions ]
);

export const getPostRevision = createSelector(
	( state, siteId, postId, revisionId ) => get(
		state.posts.revisions.revisions,
		[ siteId, postId, revisionId ],
		null
	),
	( state ) => [ state.posts.revisions.revisions ]
);
