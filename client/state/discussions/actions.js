/**
 * Internal dependencies
 */
import {
	DISCUSSIONS_COUNTS_UPDATE,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_REQUEST_FAILURE,
	DISCUSSIONS_REQUEST_SUCCESS,
} from '../action-types';

const DEFAULT_STATUS = 'all';

/***
 * return an action object used in signalling that the discussions for the specified
 * site post have been requested.
 *
 * @param   {Number} siteId site identifier
 * @param   {Number} postId post identifier
 * @param   {String} status status filter. Defaults to all posts.
 * @returns {Object}        action object
 */
export function requestPostComments( siteId, postId, status = DEFAULT_STATUS ) {
	return {
		type: DISCUSSIONS_REQUEST,
		siteId,
		postId,
		status
	};
}

/***
 * return an action object used in signalling that the request for discussions for a specific
 * site post has succeeded.
 *
 * @param   {Number} siteId site identifier
 * @param   {Number} postId post identifier
 * @param   {String} status status filter. Defaults to all posts
 * @returns {Object}        action object
 */
export function successPostCommentsRequest( siteId, postId, status, comments ) {
	return {
		type: DISCUSSIONS_REQUEST_SUCCESS,
		siteId,
		postId,
		status,
		comments
	};
}

/***
 * return an action object used in signalling that the request for discussions for a specific
 * site post has failed.
 *
 * @param   {Number} siteId site identifier
 * @param   {Number} postId post identifier
 * @param   {String} status status filter. Defaults to all posts
 * @param   {Object} error  error
 * @returns {Object}        action object
 */
export function failPostCommentsRequest( siteId, postId, status, error ) {
	return {
		type: DISCUSSIONS_REQUEST_FAILURE,
		siteId,
		postId,
		status,
		error,
	};
}

/***
 * return an action object used in signalling that the comment count for a postId
 * is beign received.
 *
 * @param   {Number} siteId site identifier
 * @param   {Number} postId post identifier
 * @param   {Number} count  total comment count
 * @returns {Object}        action object
 */
export function receivePostCommentsCount( siteId, postId, count ) {
	return {
		type: DISCUSSIONS_COUNTS_UPDATE,
		siteId,
		postId,
		count
	};
}

/***
 * returns an action object used in signalling that the content update
 * request has been successful.
 *
 * @param   {Number} siteId    site identifier
 * @param   {Number} commentId comment identifier
 * @param   {String} content   new comment content
 * @returns {Object}           action object
 */
export function successCommentContentUpdateRequest( siteId, commentId, content ) {
	return {
		type: DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_SUCCESS,
		siteId,
		commentId,
		content
	};
}

/***
* returns an action object used in signalling that the content update
* request has failed.
 *
 * @param   {Number} siteId    site identifier
 * @param   {Number} commentId comment identifier
 * @param   {Number} content   comment content
 * @param   {Object} error     error
 * @returns {Object}           action object
 */
export function failCommentContentUpdateRequest( siteId, commentId, content, error ) {
	return {
		type: DISCUSSIONS_ITEM_CONTENT_UPDATE_REQUEST_FAILURE,
		siteId,
		commentId,
		content,
		error
	};
}

/***
 * returns an action object used in signalling that the like update
 * request has been successful.
 *
 * @param   {Number}  siteId    site identifier
 * @param   {Number}  commentId comment identifier
 * @param   {Number}  source    event source
 * @param   {Boolean} iLike     is comment liked by the current user?
 * @param   {Number}  likeCount total count of likes for the specified comment
 * @returns {Object}            action object
 */
export function sucessCommentLikeRequest( siteId, commentId, source, iLike, likeCount ) {
	return {
		type: DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
		siteId,
		commentId,
		source,
		iLike,
		likeCount,
	};
}

/***
 * returns an action object used in signalling that the like update
 * request has failed.
 *
 * @param   {Number} siteId    site identifier
 * @param   {Number} commentId comment identifier
 * @param   {String} source    event source
 * @param   {Object} error     error
 * @returns {Object}           action object
 */
export function failCommentLikeRequest( siteId, commentId, source, error ) {
	return {
		type: DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
		siteId,
		commentId,
		source,
		error
	};
}

/***
 * returns an action object used in signalling that the status update
 * request has been successful.
 *
 * @param   {Number} siteId    site identifier
 * @param   {Number} commentId post identifier
 * @param   {String} status    new comment status
 * @returns {Object}           action object
 */
export function successCommentStatusUpdateRequest( siteId, commentId, status ) {
	return {
		type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
		siteId,
		commentId,
		status
	};
}

/***
 * returns an action object used in signalling that the status update
 * request has failed.
 *
 * @param   {Number} siteId    site identifier
 * @param   {Number} commentId post identifier
 * @param   {String} status    failed comment status
 * @param   {Object} error     error description
 * @returns {Object}           action object
 */
export function failCommentStatusUpdateRequest( siteId, commentId, status, error ) {
	return {
		type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
		siteId,
		commentId,
		status,
		error
	};
}
