/**
 * External dependencies
 */
import { cloneDeep, findIndex, get, isUndefined, map, omitBy, orderBy, partial } from 'lodash';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import { normalizePostForDisplay } from '../utils';
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';
import { diffWords } from 'lib/text-utils';

export const normalizeForDisplay = normalizePostForDisplay;
export function normalizeForEditing( revision ) {
	if ( ! revision ) {
		return null;
	}

	return decodeEntities( cloneDeep( revision ) );
}

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

export const getPostRevisionChanges = createSelector(
	( state, siteId, postId, revisionId ) => {
		const orderedRevisions = orderBy(
			getPostRevisions( state, siteId, postId ),
			'date', 'desc',
		);
		const revisionIndex = findIndex( orderedRevisions, { id: revisionId } );
		if ( revisionIndex === -1 ) {
			return [];
		}
		return map(
			diffWords(
				get( orderedRevisions, [ revisionIndex + 1, 'content' ], '' ),
				orderedRevisions[ revisionIndex ].content
			),
			change => omitBy( change, isUndefined )
		);
	},
	( state ) => [ state.posts.revisions.revisions ],
);
