/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST } from 'state/action-types';
import {
	successCommentContentUpdateRequest,
	failCommentContentUpdateRequest,
} from 'state/discussions/actions';

/**
* Dispatches a request update the content of a comment
*
* @param   {Function} dispatch Redux dispatcher
* @param   {Object}   action   Redux action
* @param   {Function} next     data-layer-bypassing dispatcher
* @returns {Promise}           Promise
*/
export const requestCommentContentUpdate = ( { dispatch }, action, next ) => {
	const {
		siteId,
		commentId,
		content
	} = action;

	dispatch( http( {
		apiVersion: '1.1',
		method: 'POST',
		path: `/sites/${ siteId }/comments/${ commentId }`,
		body: { content },
	} ) );

	return next( action );
};

/**
 * Dispatches returned WordPress.com comment update
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object}   action   Redux action
 * @param {Function} next     dispatches to next middleware in chain
 * @param {String}   content  updated comment content
 */
export const receiveContentUpdate = ( { dispatch }, action, next, { content } ) => {
	const {
		siteId,
		commentId
	} = action;

	dispatch( successCommentContentUpdateRequest( siteId, commentId, content ) );
};

/**
 * Dispatches returned error from comment update request
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
		content
	} = action;

	dispatch( failCommentContentUpdateRequest( siteId, commentId, content, error ) );
};

export const dispatchContentUpdateRequest = dispatchRequest( requestCommentContentUpdate, receiveContentUpdate, receiveError );

export default {
	[ DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST ]: [ dispatchContentUpdateRequest ]
};
