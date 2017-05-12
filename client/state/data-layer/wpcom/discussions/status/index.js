/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST } from 'state/action-types';
import {
	successCommentStatusUpdateRequest,
	failCommentStatusUpdateRequest,
} from 'state/discussions/actions';

 /**
  * Dispatches a request to update the status of a comment
  *
  * @param   {Function} dispatch Redux dispatcher
  * @param   {Object}   action   Redux action
	* @param   {Function} next     data-layer-bypassing dispatcher
  * @returns {Promise}           Promise
  */
export const requestCommentStatusUpdate = ( { dispatch }, action, next ) => {
	const {
		siteId,
		commentId,
		status
	} = action;

	dispatch( http( {
		apiVersion: '1.1',
		method: 'POST',
		path: `/sites/${ siteId }/comments/${ commentId }`,
		body: { status }
	} ) );

	return next( action );
};

/**
 * Dispatches returned WordPress.com comment status
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object}   action   Redux action
 * @param {Function} next     dispatches to next middleware in chain
 * @param {String}   content  updated comment content
 */
export const receiveStatusUpdate = ( { dispatch }, action, next, { status } ) => {
	const {
		siteId,
		commentId
	} = action;

	dispatch( successCommentStatusUpdateRequest( siteId, commentId, status ) );
};

/**
 * Dispatches returned error from comment status update request
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object}   action   Redux action
 * @param {Function} next     dispatches to next middleware in chain
 * @param {Object}   rawError raw error from HTTP request
 */
export const receiveError = ( { dispatch }, action, next, rawError ) => {
	const error = rawError instanceof Error
		? rawError.message
		: rawError;
	const {
		siteId,
		commentId,
		status
	} = action;

	dispatch( failCommentStatusUpdateRequest( siteId, commentId, status, error ) );
};

export const dispatchStatusUpdateRequest = dispatchRequest( requestCommentStatusUpdate, receiveStatusUpdate, receiveError );

export default {
	[ DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST ]: [ dispatchStatusUpdateRequest ]
};
