/**
 * Internal dependencies
 */
import {
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Action creator function: POST_REVISIONS_REQUEST
 *
 * @param {String} siteId of the revisions
 * @param {String} postId of the revisions
 * @param {String} [postType='post'] post type of the revisions
 * @return {Object} action object
 */
export const requestPostRevisions = ( siteId, postId, postType = 'post' ) => ( {
	type: POST_REVISIONS_REQUEST,
	postId,
	postType,
	siteId
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
	siteId, postId,
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
	siteId, postId, error
} );

/**
 * Action creator function: POST_REVISIONS_RECEIVE
 *
 * @param {String} siteId of the revisions
 * @param {String} postId of the revisions
 * @param {Object} revisions already normalized
 * @return {Object} action object
 */
export const receivePostRevisions = ( siteId, postId, revisions ) => ( {
	// NOTE: We expect all revisions to be on the same post, thus highly
	// coupling it to how the WP-API returns revisions, instead of being able
	// to "receive" large (possibly unrelated) batch of revisions.
	type: POST_REVISIONS_RECEIVE,
	siteId, postId, revisions,
} );
