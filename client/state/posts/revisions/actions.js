import {
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_SELECT,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/posts/revisions';

import 'calypso/state/posts/init';

/**
 * Action creator function: POST_REVISIONS_REQUEST
 * @param {string} siteId of the revisions
 * @param {string} postId of the revisions
 * @param {string} postType of the parent post
 * @param {string} [comparisons] list of revision objects to compare in format:
 * 					[
 * 						{ from: 6, to: 8 },
 * 						{ from: 4, to: 5 },
 * 					]
 * 					Optional. If not provided, the API will return a set of sequential diffs
 * @returns {Object} action object
 */
export const requestPostRevisions = ( siteId, postId, postType = 'posts', comparisons = [] ) => ( {
	type: POST_REVISIONS_REQUEST,
	comparisons,
	postId,
	postType,
	siteId,
} );

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

export const closePostRevisionsDialog = () => ( {
	type: POST_REVISIONS_DIALOG_CLOSE,
} );
