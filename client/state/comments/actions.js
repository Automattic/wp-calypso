/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import wpcom from 'lib/wp';
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_EDIT,
	COMMENTS_EDIT_FAILURE,
	COMMENTS_EDIT_SUCCESS,
	COMMENTS_LIST_REQUEST,
	COMMENTS_REQUEST,
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
	COMMENTS_REPLY_WRITE,
	COMMENTS_WRITE,
	COMMENT_REQUEST,
	COMMENTS_TREE_SITE_REQUEST,
} from '../action-types';
import { NUMBER_OF_COMMENTS_PER_FETCH } from './constants';

export const requestComment = ( { siteId, commentId } ) => ( {
	type: COMMENT_REQUEST,
	siteId,
	commentId
} );

/***
 * Creates a thunk that requests comments for a given post
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {String} status status filter. Defaults to approved posts
 * @returns {Function} thunk that requests comments for a given post
 */
export function requestPostComments( {
	siteId,
	postId,
	status = 'approved',
	direction = 'before'
} ) {
	if ( ! isEnabled( 'comments/filters-in-posts' ) ) {
		status = 'approved';
	}

	return {
		type: COMMENTS_REQUEST,
		siteId,
		postId,
		direction,
		query: {
			order: direction === 'before' ? 'DESC' : 'ASC',
			number: NUMBER_OF_COMMENTS_PER_FETCH,
			status,
		},
	};
}

/**
 * Creates an action that request a list of comments for a given query.
 * Except the two query properties descibed here, this function accepts all query parameters
 * listed in the API docs:
 * @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/
 *
 * @param {Object} query API call parameters
 * @param {String} query.listType Type of list to return (required as 'site')
 * @param {Number} query.siteId Site identifier
 * @returns {Object} Action that requests a comment list
 */
export const requestCommentsList = query => ( {
	type: COMMENTS_LIST_REQUEST,
	query,
} );

/**
 * Creates an action that requests the comments tree for a given site.
 * @param {Object} query API call parameters
 * @param {Number} query.siteId Site identifier
 * @param {String} query.status Status filter
 * @returns {Object} Action that requests a comment tree
 */
export const requestCommentsTreeForSite = query => ( {
	type: COMMENTS_TREE_SITE_REQUEST,
	query,
} );

/**
 * Creates an action that permanently deletes a comment
 * or removes a comment placeholder from the state
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number|String} commentId comment or comment placeholder identifier
 * @param {Object} options Action options
 * @param {Boolean} options.showSuccessNotice Announce the delete success with a notice (default: true)
 * @returns {Object} action that deletes a comment
 */
export const deleteComment = ( siteId, postId, commentId, options = { showSuccessNotice: true } ) => ( {
	type: COMMENTS_DELETE,
	siteId,
	postId,
	commentId,
	options,
} );

/***
 * Creates a write comment action for a siteId and postId
 * @param {String} commentText text of the comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @returns {Function} a thunk that creates a comment for a given post
 */
export const writeComment = ( commentText, siteId, postId ) => ( {
	type: COMMENTS_WRITE,
	siteId,
	postId,
	commentText,
} );

/***
 * Creates a reply to comment action for a siteId, postId and commentId
 * @param {String} commentText text of the comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} parentCommentId parent comment identifier
 * @returns {Function} a thunk that creates a comment for a given post
 */
export const replyComment = ( commentText, siteId, postId, parentCommentId ) => ( {
	type: COMMENTS_REPLY_WRITE,
	siteId,
	postId,
	parentCommentId,
	commentText,
} );

/***
 * Creates a thunk that likes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @returns {Function} think that likes a comment
 */
export const likeComment = ( siteId, postId, commentId ) => ( {
	type: COMMENTS_LIKE,
	siteId,
	postId,
	commentId,
} );

/***
 * Creates a thunk that unlikes a comment
 * @param {Number} siteId site identifier
 * @param {Number} postId post identifier
 * @param {Number} commentId comment identifier
 * @returns {Function} think that unlikes a comment
 */
export const unlikeComment = ( siteId, postId, commentId ) => ( {
	type: COMMENTS_UNLIKE,
	siteId,
	postId,
	commentId,
} );

/**
 * Creates an action that changes a comment status.
 * @param {Number} siteId Site identifier
 * @param {Number} postId Post identifier
 * @param {Number} commentId Comment identifier
 * @param {Number} status New status
 * @returns {Object} Action that changes a comment status
 */
export const changeCommentStatus = ( siteId, postId, commentId, status ) => ( {
	type: COMMENTS_CHANGE_STATUS,
	siteId,
	postId,
	commentId,
	status,
} );

export function editComment( siteId, postId, commentId, content ) {
	return dispatch => {
		dispatch( {
			type: COMMENTS_EDIT,
			siteId,
			postId,
			content,
		} );

		return wpcom
			.site( siteId )
			.comment( commentId )
			.update( { content } )
			.then( data =>
				dispatch( {
					type: COMMENTS_EDIT_SUCCESS,
					siteId,
					postId,
					commentId,
					content: data.content,
				} ),
			)
			.catch( () =>
				dispatch( {
					type: COMMENTS_EDIT_FAILURE,
					siteId,
					postId,
					commentId,
				} ),
			);
	};
}
