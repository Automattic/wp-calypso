/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import {
	COMMENT_COUNTS_REQUEST,
	COMMENT_REQUEST,
	COMMENTS_CHANGE_STATUS,
	COMMENTS_DELETE,
	COMMENTS_EDIT,
	COMMENTS_LIKE,
	COMMENTS_LIST_REQUEST,
	COMMENTS_RECEIVE,
	COMMENTS_RECEIVE_ERROR,
	COMMENTS_REPLY_WRITE,
	COMMENTS_REQUEST,
	COMMENTS_SET_ACTIVE_REPLY,
	COMMENTS_TREE_SITE_REQUEST,
	COMMENTS_UNLIKE,
	COMMENTS_WRITE,
} from 'state/action-types';
import { READER_EXPAND_COMMENTS } from 'state/reader/action-types';
import { NUMBER_OF_COMMENTS_PER_FETCH } from './constants';
import { getSiteComment } from 'state/comments/selectors';

import 'state/data-layer/wpcom/comments';
import 'state/data-layer/wpcom/sites/comment-counts';
import 'state/data-layer/wpcom/sites/comments-tree';
import 'state/data-layer/wpcom/sites/comments';
import 'state/data-layer/wpcom/sites/posts/replies';

import 'state/comments/init';

/**
 * Creates an action that requests a single comment for a given site.
 *
 * @param {object} options options object.
 * @param {number} options.siteId Site identifier
 * @param {number} options.commentId Comment identifier
 * @param {object} options.query API call parameters
 * @returns {object} Action that requests a single comment
 */
export const requestComment = ( { siteId, commentId, query = {} } ) => ( {
	type: COMMENT_REQUEST,
	siteId,
	commentId,
	query,
} );

/**
 * Creates an action for receiving comments for a specific post on a site.
 *
 * @param {object} options options object.
 * @param {number} options.siteId site identifier
 * @param {number} options.postId post identifier
 * @param {Array} options.comments the list of comments received
 * @param {boolean} options.commentById were the comments retrieved by ID directly?
 * @returns {object} Action for receiving comments
 */
export const receiveComments = ( { siteId, postId, comments, commentById = false } ) => ( {
	type: COMMENTS_RECEIVE,
	siteId,
	postId,
	comments,
	commentById,
} );

/**
 * Creates an action for receiving comment errors.
 *
 * @param {object} options options object.
 * @param {number} options.siteId site identifier
 * @param {number} options.commentId comment identifier
 * @returns {object} Action for receiving comment errors
 */
export const receiveCommentsError = ( { siteId, commentId } ) => ( {
	type: COMMENTS_RECEIVE_ERROR,
	siteId,
	commentId,
} );

/**
 * Creates an action that requests comments for a given post
 *
 * @param {object} options options object.
 * @param {number} options.siteId site identifier
 * @param {number} options.postId post identifier
 * @param {string} options.status status filter. Defaults to approved posts
 * @returns {Function} action that requests comments for a given post
 */
export function requestPostComments( {
	siteId,
	postId,
	status = 'approved',
	direction = 'before',
	isPoll = false,
} ) {
	if ( ! isEnabled( 'comments/filters-in-posts' ) ) {
		status = 'approved';
	}

	return {
		type: COMMENTS_REQUEST,
		siteId,
		postId,
		direction,
		isPoll,
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
 *
 * @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/
 *
 * @param {object} query API call parameters
 * @param {string} query.listType Type of list to return (required as 'site')
 * @param {number} query.siteId Site identifier
 * @returns {object} Action that requests a comment list
 */
export const requestCommentsList = ( query ) => ( {
	type: COMMENTS_LIST_REQUEST,
	query,
} );

/**
 * Creates an action that requests the comments tree for a given site.
 *
 * @param {object} query API call parameters
 * @param {number} query.siteId Site identifier
 * @param {string} query.status Status filter
 * @returns {object} Action that requests a comment tree
 */
export const requestCommentsTreeForSite = ( query ) => ( {
	type: COMMENTS_TREE_SITE_REQUEST,
	query,
} );

/**
 * Creates an action that requests comment counts for a given site.
 *
 * @param {number} siteId Site identifier
 * @param {number} [postId] Post identifier
 * @returns {object} Action that requests comment counts by site.
 */
export const requestCommentCounts = ( siteId, postId ) => ( {
	type: COMMENT_COUNTS_REQUEST,
	siteId,
	postId,
} );

/**
 * Creates an action that permanently deletes a comment
 * or removes a comment placeholder from the state
 *
 * @param {number} siteId site identifier
 * @param {number} postId post identifier
 * @param {number|string} commentId comment or comment placeholder identifier
 * @param {object} options Action options
 * @param {boolean} options.showSuccessNotice Announce the delete success with a notice (default: true)
 * @param {object} refreshCommentListQuery Forces requesting a fresh copy of a comments page with these query parameters.
 * @returns {object} action that deletes a comment
 */
export const deleteComment = (
	siteId,
	postId,
	commentId,
	options = { showSuccessNotice: true },
	refreshCommentListQuery = null
) => ( dispatch, getState ) => {
	const siteComment = getSiteComment( getState(), siteId, commentId );
	const previousStatus = siteComment && siteComment.status;

	dispatch( {
		type: COMMENTS_DELETE,
		siteId,
		postId,
		commentId,
		options,
		refreshCommentListQuery,
		meta: {
			comment: {
				previousStatus,
			},
			dataLayer: {
				trackRequest: true,
			},
		},
	} );
};

/**
 * Creates a write comment action for a siteId and postId
 *
 * @param {string} commentText text of the comment
 * @param {number} siteId site identifier
 * @param {number} postId post identifier
 * @returns {Function} a thunk that creates a comment for a given post
 */
export const writeComment = ( commentText, siteId, postId ) => ( {
	type: COMMENTS_WRITE,
	siteId,
	postId,
	commentText,
} );

/**
 * Creates a reply to comment action for a siteId, postId and commentId
 *
 * @param {string} commentText text of the comment
 * @param {number} siteId site identifier
 * @param {number} postId post identifier
 * @param {number} parentCommentId parent comment identifier
 * @param {object} refreshCommentListQuery Forces requesting a fresh copy of a comments page with these query parameters.
 * @returns {Function} a thunk that creates a comment for a given post
 */
export const replyComment = (
	commentText,
	siteId,
	postId,
	parentCommentId,
	refreshCommentListQuery = null
) => ( {
	type: COMMENTS_REPLY_WRITE,
	siteId,
	postId,
	parentCommentId,
	commentText,
	refreshCommentListQuery,
} );

/**
 * Creates a thunk that likes a comment
 *
 * @param {number} siteId site identifier
 * @param {number} postId post identifier
 * @param {number} commentId comment identifier
 * @returns {Function} think that likes a comment
 */
export const likeComment = ( siteId, postId, commentId ) => ( {
	type: COMMENTS_LIKE,
	siteId,
	postId,
	commentId,
} );

/**
 * Creates an action that unlikes a comment
 *
 * @param {number} siteId site identifier
 * @param {number} postId post identifier
 * @param {number} commentId comment identifier
 * @returns {object} Action that unlikes a comment
 */
export const unlikeComment = ( siteId, postId, commentId ) => ( {
	type: COMMENTS_UNLIKE,
	siteId,
	postId,
	commentId,
} );

/**
 * Creates an action that changes a comment status.
 *
 * @param {number} siteId Site identifier
 * @param {number} postId Post identifier
 * @param {number} commentId Comment identifier
 * @param {string} status New status
 * @param {object} refreshCommentListQuery Forces requesting a fresh copy of a comments page with these query parameters.
 * @returns {object} Action that changes a comment status
 */
export const changeCommentStatus = (
	siteId,
	postId,
	commentId,
	status,
	refreshCommentListQuery = null
) => ( dispatch, getState ) => {
	const siteComment = getSiteComment( getState(), siteId, commentId );
	const previousStatus = siteComment && siteComment.status;

	dispatch( {
		type: COMMENTS_CHANGE_STATUS,
		siteId,
		postId,
		commentId,
		status,
		refreshCommentListQuery,
		meta: {
			comment: {
				previousStatus,
			},
			dataLayer: {
				trackRequest: true,
			},
		},
	} );
};

/**
 * @typedef {object} Comment
 * @property {number} ID specific API version for request
 * @property {Author} author comment author
 * @property {string} content comment content
 * @property {Date} date date the comment was created
 * @property {string} status status of the comment
 */

/**
 * @typedef {object} Author
 * @property {string} name Full name of the comment author
 * @property {string} url Address of the commenter site or blog
 */

/**
 * Creates an action that edits a comment.
 *
 * @param {number} siteId Site identifier
 * @param {number} postId Post identifier
 * @param {number} commentId Comment identifier
 * @param {Comment} comment New comment data
 * @returns {object} Action that edits a comment
 */
export const editComment = ( siteId, postId, commentId, comment ) => ( {
	type: COMMENTS_EDIT,
	siteId,
	postId,
	commentId,
	comment,
} );

/**
 * Expand selected comments to the level of displayType. It's important to note that a comment will
 * only get expanded and cannot unexpand from this action.
 * That means comments can only go in the direction of: hidden --> singleLine --> excerpt --> full
 *
 * @param {object} options options object.
 * @param {number} options.siteId siteId for the comments to expand.
 * @param {Array<number>} options.commentIds list of commentIds to expand.
 * @param {number} options.postId postId for the comments to expand.
 * @param {string} options.displayType which displayType to set the comment to.
 *
 * @returns {object} reader expand comments action
 */
export const expandComments = ( { siteId, commentIds, postId, displayType } ) => ( {
	type: READER_EXPAND_COMMENTS,
	payload: { siteId, commentIds, postId, displayType },
} );

/**
 * Creates an action that sets the active reply for a given site ID and post ID
 * This is used on the front end to show a reply box under the specified comment.
 *
 * @param {object} options options object.
 * @param {number} options.siteId site identifier
 * @param {number} options.postId post identifier
 * @param {number} options.commentId comment identifier
 * @returns {object} Action to set active reply
 */
export const setActiveReply = ( { siteId, postId, commentId } ) => ( {
	type: COMMENTS_SET_ACTIVE_REPLY,
	payload: {
		siteId,
		postId,
		commentId,
	},
} );
