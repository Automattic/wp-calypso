import { POST_REVISIONS_RECEIVE, POST_REVISIONS_SELECT } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/posts/revisions';

import 'calypso/state/posts/init';

/**
 * Action creator function: POST_REVISIONS_RECEIVE
 */
export const receivePostRevisions = ( { diffs, postId, revisions, revision_fields, siteId } ) => ( {
	type: POST_REVISIONS_RECEIVE,
	diffs,
	postId,
	revisions,
	revision_fields,
	siteId,
} );

export const selectPostRevision = ( revisionId ) => ( {
	type: POST_REVISIONS_SELECT,
	revisionId,
} );
