/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	DISCUSSIONS_ITEM_LIKE_REQUEST,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST
} from 'state/action-types';
import {
	sucessCommentLikeRequest,
	failCommentLikeRequest,
} from 'state/discussions/actions';

 /**
  * Dispatches a request to like a comment
  *
	* @param   {Function} dispatch Redux dispatcher
  * @param   {Object}   action   Redux action
	* @param   {Function} next     data-layer-bypassing dispatcher
  * @returns {Promise}           Promise
  */
export const requestCommentLike = ( { dispatch }, action, next ) => {
	const {
		siteId,
		commentId,
		source
	} = action;

	dispatch( http( {
		apiVersion: '1.1',
		method: 'POST',
		path: `/sites/${ siteId }/comments/${ commentId }/likes/new`,
		body: { source }
	} ) );

	return next( action );
};

/**
 * Dispatches a request to unlike a comment
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Function} next     data-layer-bypassing dispatcher
 * @returns {Promise}           Promise
 */
export const requestCommentUnLike = ( { dispatch }, action, next ) => {
	const {
		siteId,
		commentId,
		source
	} = action;

	dispatch( http( {
		apiVersion: '1.1',
		method: 'POST',
		path: `/sites/${ siteId }/comments/${ commentId }/likes/mine/delete`,
		body: { source }
	} ) );

	return next( action );
};

/**
 * Dispatches returned WordPress.com comment status
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object}   action   Redux action
 * @param {Function} next     dispatches to next middleware in chain
 * @param {String}   result   request result
 */
export const receiveLikeUpdate = ( { dispatch }, action, next, result ) => {
	const {
		siteId,
		commentId,
		source
	} = action;
	const {
		i_like,
		like_count
	} = result;

	dispatch( sucessCommentLikeRequest( siteId, commentId, source, i_like, like_count ) );
};

/**
 * Dispatches returned error from comment like/unlike request
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
		source
	} = action;

	dispatch( failCommentLikeRequest( siteId, commentId, source, error ) );
};

export const dispatchLikeUpdateRequest = dispatchRequest( requestCommentLike, receiveLikeUpdate, receiveError );
export const dispatchUnLikeUpdateRequest = dispatchRequest( requestCommentUnLike, receiveLikeUpdate, receiveError );

export default {
	[ DISCUSSIONS_ITEM_LIKE_REQUEST ]: [ dispatchLikeUpdateRequest ],
	[ DISCUSSIONS_ITEM_UNLIKE_REQUEST ]: [ dispatchUnLikeUpdateRequest ]
};
