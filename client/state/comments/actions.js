/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import wpcom from 'lib/wp';
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_CHANGE_STATUS_FAILURE,
	COMMENTS_CHANGE_STATUS_SUCESS,
	COMMENTS_EDIT,
	COMMENTS_EDIT_FAILURE,
	COMMENTS_EDIT_SUCCESS,
	COMMENTS_LIST_REQUEST,
	COMMENTS_REQUEST,
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE,
	COMMENTS_REMOVE,
	COMMENTS_WRITE,
} from '../action-types';
import { NUMBER_OF_COMMENTS_PER_FETCH } from './constants';

/***
 * Creates a thunk that requests comments for a given post
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {String} status status filter. Defaults to approved posts
 * @returns {Function} thunk that requests comments for a given post
 */
export function requestPostComments( siteId, postId, status = 'approved' ) {
	if ( ! isEnabled( 'comments/filters-in-posts' ) ) {
		status = 'approved';
	}

	return {
		type: COMMENTS_REQUEST,
		siteId,
		postId,
		query: {
			order: 'DESC',
			number: NUMBER_OF_COMMENTS_PER_FETCH,
			status
		}
	};
}

export const requestCommentsList = query => ( {
	type: COMMENTS_LIST_REQUEST,
	query,
} );

/***
 * Creates a remove comment action for a siteId, postId, commentId
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number|String} commentId comment identifier to remove
 * @returns {Object} remove action
 */
export function removeComment( siteId, postId, commentId ) {
	return {
		type: COMMENTS_REMOVE,
		siteId,
		postId,
		commentId
	};
}

/***
 * Creates a thunk that creates a comment for a given post
 * @param {String} commentText text of the comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number|undefined} parentCommentId parent comment identifier
 * @returns {Function} a thunk that creates a comment for a given post
 */
export const writeComment = ( commentText, siteId, postId, parentCommentId = null ) => ( {
	type: COMMENTS_WRITE,
	siteId,
	postId,
	parentCommentId,
	commentText
} );

/***
 * Creates a thunk that likes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @returns {Function} think that likes a comment
 */
export function likeComment( siteId, postId, commentId ) {
	return ( dispatch ) => {
		// optimistic update
		dispatch( {
			type: COMMENTS_LIKE,
			siteId,
			postId,
			commentId
		} );

		// optimistic revert on error, return here for test more conveniently
		return wpcom.site( siteId ).comment( commentId ).like().add( { source: 'reader' } ).then( ( data ) => dispatch( {
			type: COMMENTS_LIKE_UPDATE,
			siteId,
			postId,
			commentId,
			iLike: data.i_like,
			likeCount: data.like_count
		} ) ).catch( () => dispatch( {
			type: COMMENTS_UNLIKE,
			siteId,
			postId,
			commentId
		} ) );
	};
}

/***
 * Creates a thunk that unlikes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @returns {Function} think that unlikes a comment
 */
export function unlikeComment( siteId, postId, commentId ) {
	return ( dispatch ) => {
		// optimistic update
		dispatch( {
			type: COMMENTS_UNLIKE,
			siteId,
			postId,
			commentId
		} );

		// optimistic revert on error, return here for test more conveniently
		return wpcom.site( siteId ).comment( commentId ).like().del( { source: 'reader' } ).then( ( data ) => dispatch( {
			type: COMMENTS_LIKE_UPDATE,
			siteId,
			postId,
			commentId,
			iLike: data.i_like,
			likeCount: data.like_count
		} ) ).catch( () => dispatch( {
			type: COMMENTS_LIKE,
			siteId,
			postId,
			commentId
		} ) );
	};
}

export function changeCommentStatus( siteId, postId, commentId, status ) {
	return dispatch => {
		dispatch( {
			type: COMMENTS_CHANGE_STATUS,
			siteId,
			postId,
			commentId
		} );

		return wpcom.site( siteId ).comment( commentId ).update( { status } ).then( data => dispatch( {
			type: COMMENTS_CHANGE_STATUS_SUCESS,
			siteId,
			postId,
			commentId,
			status: data.status
		} ) ).catch( () => dispatch( {
			type: COMMENTS_CHANGE_STATUS_FAILURE,
			siteId,
			postId,
			commentId
		} ) );
	};
}

export function editComment( siteId, postId, commentId, content ) {
	return dispatch => {
		dispatch( {
			type: COMMENTS_EDIT,
			siteId,
			postId,
			content
		} );

		return wpcom.site( siteId ).comment( commentId ).update( { content } ).then( data => dispatch( {
			type: COMMENTS_EDIT_SUCCESS,
			siteId,
			postId,
			commentId,
			content: data.content
		} ) ).catch( () => dispatch( {
			type: COMMENTS_EDIT_FAILURE,
			siteId,
			postId,
			commentId
		} ) );
	};
}
