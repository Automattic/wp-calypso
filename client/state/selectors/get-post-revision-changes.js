/** @format */

/**
 * External dependencies
 */

import { findIndex, get, isUndefined, map, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import createSelector from 'lib/create-selector';
import { diffWords } from 'lib/text-utils';
import getPostRevisions from 'state/selectors/get-post-revisions';

const diffKey = ( key, obj1, obj2 ) =>
	map( diffWords( get( obj1, key, '' ), get( obj2, key, '' ) ), change =>
		omitBy( change, isUndefined )
	);

const getPostRevisionChanges = createSelector(
	( state, siteId, postId, revisionId ) => {
		const noChanges = { content: [], title: [] };
		if ( ! isEnabled( 'post-editor/revisions' ) ) {
			return noChanges;
		}

		const orderedRevisions = getPostRevisions( state, siteId, postId, 'display' );
		const revisionIndex = findIndex( orderedRevisions, { id: revisionId } );
		if ( revisionIndex === -1 ) {
			return noChanges;
		}
		const previousRevision = orderedRevisions[ revisionIndex + 1 ];
		const currentRevision = orderedRevisions[ revisionIndex ];
		return {
			content: diffKey( 'content', previousRevision, currentRevision ),
			title: diffKey( 'title', previousRevision, currentRevision ),
		};
	},
	state => [ state.posts.revisions.revisions ]
);

export default getPostRevisionChanges;
