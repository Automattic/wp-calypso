/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	DISCUSSIONS_COUNTS_UPDATE,
	DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST,
	DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_LIKE_REQUEST,
	DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_REMOVE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST_FAILURE,
	DISCUSSIONS_ITEM_UNLIKE_REQUEST_SUCCESS,
	DISCUSSIONS_REQUEST,
	DISCUSSIONS_REQUEST_FAILURE,
	DISCUSSIONS_REQUEST_SUCCESS,
} from '../action-types';

const DEFAULT_STATUS = 'all';

/***
 * Creates a thunk that requests comments for a given post
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {String} status status filter. Defaults to all posts
 * @returns {Function} thunk that requests comments for a given post
 */
export function requestPostComments( siteId, postId, status = DEFAULT_STATUS ) {
	return dispatch => {
		const payload = {
			siteId,
			postId,
			status
		};

		dispatch( {
			type: DISCUSSIONS_REQUEST,
			...payload
		} );

		return wpcom.site( siteId )
			.post( postId )
			.comment()
			.replies( { status } )
			.then( ( { comments, found } ) => {
				dispatch( {
					type: DISCUSSIONS_REQUEST_SUCCESS,
					...payload,
					comments
				} );

				dispatch( {
					type: DISCUSSIONS_COUNTS_UPDATE,
					...payload,
					found
				} );
			} )
			.catch( error => dispatch( {
				type: DISCUSSIONS_REQUEST_FAILURE,
				...payload,
				error
			} ) );
	};
}

/***
 * Creates a thunk that likes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @param {String} source like source. Either posts or reader. Defaults to reader.
 * @returns {Function} thunk that likes a comment
 */
export function likePostComment( siteId, postId, commentId, source = 'reader' ) {
	return dispatch => {
		const payload = {
			siteId,
			postId,
			commentId,
			source
		};

		dispatch( {
			type: DISCUSSIONS_ITEM_LIKE_REQUEST,
			...payload
		} );

		return wpcom.site( siteId )
			.comment( commentId )
			.like()
			.add( { source } )
			.then( result => dispatch( {
				type: DISCUSSIONS_ITEM_LIKE_REQUEST_SUCCESS,
				...payload,
				iLike: result.i_like,
				likeCount: result.like_count
			} ) )
			.catch( error => dispatch( {
				type: DISCUSSIONS_ITEM_LIKE_REQUEST_FAILURE,
				...payload,
				error
			} ) );
	};
}

/***
 * Creates a thunk that unlikes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @param {String} source like source. Either posts or reader. Defaults to reader.
 * @returns {Function} thunk that unlikes a comment
 */
export function unlikePostComment( siteId, postId, commentId, source = 'reader' ) {
	return ( dispatch ) => {
		const payload = {
			siteId,
			postId,
			commentId,
			source
		};

		dispatch( {
			type: DISCUSSIONS_ITEM_UNLIKE_REQUEST,
			...payload
		} );

		return wpcom.site( siteId )
			.comment( commentId )
			.like()
			.del( { source } )
			.then( result => dispatch( {
				type: DISCUSSIONS_ITEM_UNLIKE_REQUEST_SUCCESS,
				...payload,
				iLike: result.i_like,
				likeCount: result.like_count,
			} ) )
			.catch( error => dispatch( {
				type: DISCUSSIONS_ITEM_UNLIKE_REQUEST_FAILURE,
				...payload,
				error
			} ) );
	};
}

/***
 * Creates a thunk that changes a comment status
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @param {String} status status filter.
 * @returns {Function} thunk that unlikes a comment
 */
export function changeCommentStatus( siteId, postId, commentId, status ) {
	return dispatch => {
		const payload = {
			siteId,
			postId,
			commentId,
			status
		};

		dispatch( {
			type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST,
			...payload
		} );

		return wpcom.site( siteId )
			.comment( commentId )
			.update( { status } )
			.then( result => dispatch( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_SUCCESS,
				...payload,
				status: result.status
			} ) )
			.catch( error => dispatch( {
				type: DISCUSSIONS_ITEM_STATUS_UPDATE_REQUEST_FAILURE,
				...payload,
				error
			} ) );
	};
}

/***
 * Creates a remove comment action for a siteId, postId and commentId
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
 * @returns {Function} thunk that unlikes a comment
 */
export function editPostComment( siteId, postId, commentId, content ) {
	return dispatch => {
		const payload = {
			siteId,
			postId,
			commentId
		};

		dispatch( {
			type: DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST,
			...payload,
			content
		} );

		return wpcom.site( siteId )
			.comment( commentId )
			.update( { content } )
			.then( result => dispatch( {
				type: DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_SUCCESS,
				siteId,
				postId,
				commentId,
				content: result.content
			} ) )
			.catch( error => dispatch( {
				type: DISCUSSIONS_ITEM_EDIT_CONTENT_REQUEST_FAILURE,
				siteId,
				postId,
				commentId,
				content,
				error
			} ) );
	};
}
