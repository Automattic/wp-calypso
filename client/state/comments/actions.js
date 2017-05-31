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
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_FAILURE,
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE,
	COMMENTS_REMOVE,
	COMMENTS_ERROR
} from '../action-types';
import {
	createRequestId
} from './utils';
import {
	NUMBER_OF_COMMENTS_PER_FETCH,
	PLACEHOLDER_STATE
} from './constants';

/***
 * Internal handler for comments request failure
 * @param {Function} dispatch redux dispatch function
 * @param {String} siteId site identifier
 * @param {String} postId post identifier
 * @param {String} requestId request identifier
 * @param {Object} err error object
 */
function commentsRequestFailure( dispatch, siteId, postId, requestId, err ) {
	dispatch( {
		type: COMMENTS_REQUEST_FAILURE,
		siteId,
		postId,
		requestId,
		error: err
	} );
}

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

/***
 * Creates a placeholder comment for a given text and postId
 * @param {String} commentText text of the comment
 * @param {Number} postId post identifier
 * @param {Number|undefined} parentCommentId parent comment identifier
 * @returns {Object} comment placeholder
 */
function createPlaceholderComment( commentText, postId, parentCommentId ) {
	// We need placehodler id to be unique in the context of siteId, postId for that specific user,
	// date milliseconds will do for that purpose.
	return {
		ID: 'placeholder-' + ( new Date().getTime() ),
		parent: parentCommentId ? { ID: parentCommentId } : false,
		date: ( new Date() ).toISOString(),
		content: commentText,
		status: 'pending',
		type: 'comment',
		post: {
			ID: postId
		},
		isPlaceholder: true,
		placeholderState: PLACEHOLDER_STATE.PENDING
	};
}

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
export function writeComment( commentText, siteId, postId, parentCommentId ) {
	if ( ! commentText || ! siteId || ! postId ) {
		return;
	}

	return ( dispatch ) => {
		const placeholderComment = createPlaceholderComment( commentText, postId, parentCommentId ),
			skipSort = !! parentCommentId;

		// Insert a placeholder
		dispatch( {
			type: COMMENTS_RECEIVE,
			siteId,
			postId,
			comments: [ placeholderComment ],
			skipSort
		} );

		let apiPromise;

		if ( parentCommentId ) {
			apiPromise = wpcom.site( siteId ).post( postId ).comment( parentCommentId ).reply( {}, commentText );
		} else {
			apiPromise = wpcom.site( siteId ).post( postId ).comment().add( commentText );
		}

		return apiPromise.then( ( comment ) => {
			// remove the placeholder
			dispatch( {
				type: COMMENTS_REMOVE,
				siteId,
				postId,
				commentId: placeholderComment.ID
			} );

			// insert the real comment
			dispatch( {
				type: COMMENTS_RECEIVE,
				siteId,
				postId,
				comments: [ comment ],
				skipSort
			} );

			const requestId = createRequestId( siteId, postId, {} );

			wpcom.site( siteId )
				.post( postId )
				.comment()
				.replies()
				.then( ( { found: totalCommentsCount } ) => dispatch( {
					type: COMMENTS_COUNT_RECEIVE,
					siteId,
					postId,
					totalCommentsCount
				} ) )
				.catch( ( err ) => commentsRequestFailure( dispatch, siteId, postId, requestId, err ) );

			return comment;
		} )
		.catch( ( error ) => {
			dispatch( {
				type: COMMENTS_ERROR,
				siteId,
				postId,
				commentId: placeholderComment.ID,
				error
			} );

			throw error;
		} );
	};
}

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
