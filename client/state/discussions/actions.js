/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_REQUEST_SUCCESS,
	DISCUSSIONS_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_EDIT_REQUEST,
	DISCUSSIONS_ITEM_EDIT_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_EDIT_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_REMOVE,
	DISCUSSIONS_COUNTS_UPDATE,
} from '../action-types';

const DEFAULT_STATUS = 'all';

/***
 * Creates a thunk that requests comments for a given post
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {String} status status filter. Defaults to all posts
 * @returns {Function} thunk that requests comments for a given post
 */
export function requestPostDiscussions( siteId, postId, status = DEFAULT_STATUS ) {
	return dispatch => {
		dispatch( {
			type: DISCUSSIONS_REQUEST,
			siteId,
			postId,
			status
		} );

		return wpcom.site( siteId )
			.post( postId )
			.comment()
			.replies()
			.then( ( { comments, found } ) => {
				dispatch( {
					type: DISCUSSIONS_REQUEST_SUCCESS,
					comments,
				} );

				dispatch( {
					type: DISCUSSIONS_COUNTS_UPDATE,
					found
				} );
			} )
			.catch( error => dispatch( {
				type: DISCUSSIONS_REQUEST_FAILURE,
				error
			} ) );
	};
}

export function changeCommentStatus( siteId, postId, commentId, status ) {
	return dispatch => {
		dispatch( {
			type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
			siteId,
			postId,
			commentId
		} );

		return wpcom.site( siteId )
			.comment( commentId )
			.update( { status } )
			.then( result => dispatch( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
				siteId,
				postId,
				commentId,
				status: result.status
			} ) )
			.catch( error => dispatch( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
				siteId,
				postId,
				commentId,
				error,
			} ) );
	};
}

/***
 * Creates a remove comment action for a siteId, postId, commentId
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number|String} commentId comment identifier to remove
 * @returns {Object} remove action
 */
export function removePostComment( siteId, postId, commentId ) {
	return {
		type: DISCUSSIONS_ITEM_REMOVE,
		siteId,
		postId,
		commentId
	};
}

/***
 * Creates a thunk that edits a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @param {String} content HTML representation of the new comment content.
 * @returns {Function} think that unlikes a comment
 */
export function editComment( siteId, postId, commentId, content ) {
	return dispatch => {
		dispatch( {
			type: DISCUSSIONS_ITEM_EDIT_REQUEST,
			siteId,
			postId,
			content
		} );

		return wpcom.site( siteId )
			.comment( commentId )
			.update( { content } )
			.then( result => dispatch( {
				type: DISCUSSIONS_ITEM_EDIT_REQUEST_SUCCESS,
				siteId,
				postId,
				commentId,
				content: result.content
			} ) )
			.catch( error => dispatch( {
				type: DISCUSSIONS_ITEM_EDIT_REQUEST_FAILURE,
				siteId,
				postId,
				commentId,
				error
			} ) );
	};
}
