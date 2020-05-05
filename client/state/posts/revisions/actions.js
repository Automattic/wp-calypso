/**
 * Internal dependencies
 */
import {
	POST_REVISIONS_DIALOG_OPEN,
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_DIFF_SPLIT_VIEW,
	POST_REVISIONS_DIFF_UNIFY_VIEW,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_SELECT,
} from 'state/action-types';

import 'state/data-layer/wpcom/posts/revisions';

import 'state/posts/init';

/**
 * Action creator function: POST_REVISIONS_REQUEST
 *
 * @param {string} siteId of the revisions
 * @param {string} postId of the revisions
 * @param {string} postType of the parent post
 * @param {string} [comparisons=[]] list of revision objects to compare in format:
 * 					[
 * 						{ from: 6, to: 8 },
 * 						{ from: 4, to: 5 },
 * 					]
 * 					Optional. If not provided, the API will return a set of sequential diffs
 * @returns {object} action object
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
 *
 * @param {object} response diffs, postId, revisions, siteId,
 * @returns {object} action object
 */
export const receivePostRevisions = ( { diffs, postId, revisions, siteId } ) => ( {
	type: POST_REVISIONS_RECEIVE,
	diffs,
	postId,
	revisions,
	siteId,
} );

export const selectPostRevision = ( revisionId ) => ( {
	type: POST_REVISIONS_SELECT,
	revisionId,
} );

export const closePostRevisionsDialog = () => ( {
	type: POST_REVISIONS_DIALOG_CLOSE,
} );

export const openPostRevisionsDialog = () => ( {
	type: POST_REVISIONS_DIALOG_OPEN,
} );

export const splitPostRevisionsDiffView = () => ( {
	type: POST_REVISIONS_DIFF_SPLIT_VIEW,
} );

export const unifyPostRevisionsDiffView = () => ( {
	type: POST_REVISIONS_DIFF_UNIFY_VIEW,
} );
