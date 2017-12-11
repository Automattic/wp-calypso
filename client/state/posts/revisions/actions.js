/** @format */

/**
 * Internal dependencies
 */
import {
	POST_REVISIONS_DIALOG_OPEN,
	POST_REVISIONS_DIALOG_CLOSE,
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
	POST_REVISIONS_SELECT,
} from 'state/action-types';

/**
 * Action creator function: POST_REVISIONS_REQUEST
 *
 * @param {String} siteId of the revisions
 * @param {String} postId of the revisions
 * @param {String} [comparisons=[]] list of revision objects to compare in format:
 * 					[
 * 						{ from_revision_id: 6, to_revision_id: 8 },
 * 						{ from_revision_id: 4, to_revision_id: 5 },
 * 					]
 * 					Optional. If not provided, the API will return a set of sequential diffs
 * @return {Object} action object
 */
export const requestPostRevisions = ( siteId, postId, comparisons = [] ) => ( {
	type: POST_REVISIONS_REQUEST,
	comparisons,
	postId,
	siteId,
} );

/**
 * Action creator function: POST_REVISIONS_REQUEST_SUCCESS
 *
 * @param {String} siteId of the revisions
 * @param {String} postId of the revisions
 * @return {Object} action object
 */
export const receivePostRevisionsSuccess = ( siteId, postId ) => ( {
	type: POST_REVISIONS_REQUEST_SUCCESS,
	siteId,
	postId,
} );

/**
 * Action creator function: POST_REVISIONS_REQUEST_FAILURE
 *
 * @param {String} siteId of the revisions
 * @param {String} postId of the revisions
 * @param {Object} error raw error
 * @return {Object} action object
 */
export const receivePostRevisionsFailure = ( siteId, postId, error ) => ( {
	type: POST_REVISIONS_REQUEST_FAILURE,
	siteId,
	postId,
	error,
} );

/**
 * Action creator function: POST_REVISIONS_RECEIVE
 *
 * @param {Object} response diffs, postId, revisions, siteId,
 * @return {Object} action object
 */
export const receivePostRevisions = ( { diffs, postId, revisions, siteId } ) => ( {
	type: POST_REVISIONS_RECEIVE,
	diffs,
	postId,
	revisions,
	siteId,
} );

export const selectPostRevision = revisionId => ( {
	type: POST_REVISIONS_SELECT,
	revisionId,
} );

export const closePostRevisionsDialog = () => ( {
	type: POST_REVISIONS_DIALOG_CLOSE,
} );

export const openPostRevisionsDialog = () => ( {
	type: POST_REVISIONS_DIALOG_OPEN,
} );
