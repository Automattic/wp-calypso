/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { COMMENTS_DELETE, COMMENTS_RECEIVE, COMMENTS_COUNT_INCREMENT } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';

/**
 * Creates a placeholder comment for a given text and postId
 * We need placehodler id to be unique in the context of siteId, postId for that specific user,
 * date milliseconds will do for that purpose.
 *
 * @param   {String}           commentText     text of the comment
 * @param   {Number}           postId          post identifier
 * @param   {Number|undefined} parentCommentId parent comment identifier
 * @returns {Object}                           comment placeholder
 */
export const createPlaceholderComment = ( commentText, postId, parentCommentId ) => ( {
	ID: 'placeholder-' + ( new Date().getTime() ),
	parent: parentCommentId ? { ID: parentCommentId } : false,
	date: ( new Date() ).toISOString(),
	content: commentText,
	status: 'pending',
	type: 'comment',
	post: { ID: postId },
	isPlaceholder: true,
	placeholderState: 'PENDING'
} );

/**
 * Creates a placeholder comment for a given text and postId
 * We need placehodler id to be unique in the context of siteId, postId for that specific user,
 * date milliseconds will do for that purpose.
 *
 * @param {Function} dispatch redux dispatcher
 * @param {Object}   action   redux action
 * @param {String}   path     comments resource path
 */
export const dispatchNewCommentRequest = ( dispatch, action, path ) => {
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

/**
 * updates the placeholder comments with server values
 *
 * @param {Function} dispatch redux dispatcher
 * @param {Object}   action   redux action
 * @param {Object}   comment  updated comment from the request response
 */
export const updatePlaceholderComment = ( { dispatch }, { siteId, postId, parentCommentId, placeholderId }, comment ) => {
	// remove placeholder from state
	dispatch( bypassDataLayer( { type: COMMENTS_DELETE, siteId, postId, commentId: placeholderId } ) );
	// add new comment to state with updated values from server
	dispatch( { type: COMMENTS_RECEIVE, siteId, postId, comments: [ comment ], skipSort: !! parentCommentId } );
	// increment comments count
	dispatch( { type: COMMENTS_COUNT_INCREMENT, siteId, postId } );
};

/**
 * dispatches a error notice if creating a new comment request failed
 *
 * @param {Function} dispatch redux dispatcher
 * @param {Function} getState access the redux state
 * @param {Number}   siteId   site identifier
 * @param {Number}   postId   post identifier
 */
export const handleWriteCommentFailure = ( { dispatch, getState }, { siteId, postId } ) => {
	const post = getSitePost( getState(), siteId, postId );
	const postTitle = post && post.title && post.title.trim().slice( 0, 20 ).trim().concat( '…' );
	const error = postTitle
		? translate( 'Could not add a reply to “%(postTitle)s”', { args: { postTitle } } )
		: translate( 'Could not add a reply to this post' );

	dispatch( errorNotice( error ) );
};
