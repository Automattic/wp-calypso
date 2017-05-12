/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	DISCUSSIONS_REQUEST,
} from 'state/action-types';
import {
	successPostCommentsRequest,
	failPostCommentsRequest,
	receivePostCommentsCount,
} from 'state/discussions/actions';

 /**
  * Dispatches a request to fetch all available discussions for a post with query options
  *
	* @param   {Function} dispatch Redux dispatcher
  * @param   {Object}   action   Redux action
  * @param   {Function} next     data-layer-bypassing dispatcher
  * @returns {Promise}           Promise
  */
export const requestPostComments = ( { dispatch }, action, next ) => {
	const {
		siteId,
		postId,
		status
	} = action;

	dispatch( http( {
		apiVersion: '1.1',
		method: 'GET',
		path: `/sites/${ siteId }/posts/${ postId }/replies`,
		query: { status }
	} ) );

	return next( action );
};

/**
 * Dispatches returned WordPress.com comments
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object}   action   Redux action
 * @param {Function} next     dispatches to next middleware in chain
 * @param {Array}    comments list of comments
 * @param {Number}   found    total number of comments for the post
 */
export const receivePostComments = ( { dispatch }, action, next, { comments, found } ) => {
	const {
		siteId,
		postId,
		status
	} = action;

	dispatch( successPostCommentsRequest( siteId, postId, status, comments ) );
	dispatch( receivePostCommentsCount( siteId, postId, found ) );
};

/**
 * Dispatches returned error from comments request
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
		postId,
		status
	} = action;

	dispatch( failPostCommentsRequest( siteId, postId, status, error ) );
};

export const dispatchPostCommentsRequest = dispatchRequest( requestPostComments, receivePostComments, receiveError );

export default {
	[ DISCUSSIONS_REQUEST ]: [ dispatchPostCommentsRequest ],
};
