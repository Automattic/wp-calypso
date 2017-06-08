/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	COMMENTS_REMOVE,
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_WRITE,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';

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
		placeholderState: 'PENDING'
	};
}

export const writePostComment = ( { dispatch }, action ) => {
	const { siteId, postId, parentCommentId, commentText } = action;
	const placeholder = createPlaceholderComment( commentText, postId, parentCommentId );

	// Insert a placeholder
	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments: [ placeholder ],
		skipSort: !! parentCommentId
	} );

	const path = !! parentCommentId
		? `/sites/${ siteId }/comments/${ parentCommentId }/replies/new`
		: `/sites/${ siteId }/posts/${ postId }/replies/new`;

	dispatch( http( {
		method: 'POST',
		apiVersion: '1.1',
		path,
		body: {
			content: commentText
		},
		onSuccess: {
			...action,
			placeholderId: placeholder.ID
		},
		onFailure: action
	} ) );
};

export const handleSuccess = ( { dispatch }, { siteId, postId, parentCommentId, placeholderId }, next, comment ) => {
	// remove placeholder from state
	dispatch( { type: COMMENTS_REMOVE, siteId, postId, commentId: placeholderId } );
	// add new comment to state with updated values from server
	dispatch( { type: COMMENTS_RECEIVE, siteId, postId, comments: [ comment ], skipSort: !! parentCommentId } );
	// increment comments count
	dispatch( { type: COMMENTS_COUNT_INCREMENT, siteId, postId } );
};

export const handleFailure = ( { dispatch, getState }, { siteId, postId } ) => {
	const post = getSitePost( getState(), siteId, postId );
	const postTitle = post && post.title && post.title.trim().slice( 0, 20 ).trim().concat( '…' );
	const error = postTitle
		? translate( 'Could not add a reply to “%(postTitle)s”', { args: { postTitle } } )
		: translate( 'Could not add a reply to this post' );

	dispatch( errorNotice( error ) );
};

export default {
	[ COMMENTS_WRITE ]: [ dispatchRequest( writePostComment, handleSuccess, handleFailure ) ]
};

