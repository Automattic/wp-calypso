/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	COMMENTS_DELETE,
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_WRITE_ERROR,
} from 'state/action-types';
import { requestCommentsList } from 'state/comments/actions';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { getSitePost } from 'state/posts/selectors';
import { errorNotice } from 'state/notices/actions';

/**
 * Creates a placeholder comment for a given text and postId
 * We need placehodler id to be unique in the context of siteId, postId for that specific user,
 * date milliseconds will do for that purpose.
 *
 * @param   {string}           commentText     text of the comment
 * @param   {number}           postId          post identifier
 * @param   {number|undefined} parentCommentId parent comment identifier
 * @returns {object}                           comment placeholder
 */
export const createPlaceholderComment = ( commentText, postId, parentCommentId ) => ( {
	ID: 'placeholder-' + new Date().getTime(),
	parent: parentCommentId ? { ID: parentCommentId } : false,
	date: new Date().toISOString(),
	content: commentText,
	status: 'pending',
	type: 'comment',
	post: { ID: postId },
	isPlaceholder: true,
	placeholderState: 'PENDING',
} );

/**
 * Creates a placeholder comment for a given text and postId
 * We need placeholder id to be unique in the context of siteId and postId for that specific user,
 * date milliseconds will do for that purpose.
 *
 * @param {object}   action   redux action
 * @param {string}   path     comments resource path
 * @returns {Array}	actions
 */
export const dispatchNewCommentRequest = ( action, path ) => {
	const { siteId, postId, parentCommentId, commentText } = action;
	const placeholder = createPlaceholderComment( commentText, postId, parentCommentId );

	// Insert a placeholder
	return [
		{
			type: COMMENTS_RECEIVE,
			siteId,
			postId,
			comments: [ placeholder ],
			skipSort: !! parentCommentId,
		},

		http( {
			method: 'POST',
			apiVersion: '1.1',
			path,
			body: {
				content: commentText,
			},
			onSuccess: {
				...action,
				placeholderId: placeholder.ID,
			},
			onFailure: { ...action, placeholderId: placeholder.ID },
		} ),
	];
};

/**
 * updates the placeholder comments with server values
 *
 * @param {Function} dispatch redux dispatcher
 * @param {object}   comment  updated comment from the request response
 * @returns {Function} thunk
 */
export const updatePlaceholderComment = (
	{ siteId, postId, parentCommentId, placeholderId, refreshCommentListQuery },
	comment
) => {
	const actions = [
		// remove placeholder from state
		bypassDataLayer( { type: COMMENTS_DELETE, siteId, postId, commentId: placeholderId } ),
		// add new comment to state with updated values from server
		{
			type: COMMENTS_RECEIVE,
			siteId,
			postId,
			comments: [ comment ],
			skipSort: !! parentCommentId,
			meta: {
				comment: {
					context: 'add', //adds a hint for the counts reducer.
				},
			},
		},
		// increment comments count
		{ type: COMMENTS_COUNT_INCREMENT, siteId, postId },
	];

	if ( !! refreshCommentListQuery ) {
		actions.push( requestCommentsList( refreshCommentListQuery ) );
	}

	return actions;
};

/**
 * dispatches a error notice if creating a new comment request failed
 *
 * @param {object}   action   redux action
 * @param {object} rawError plain error object
 * @returns {Function} thunk
 */
export const handleWriteCommentFailure = (
	{ siteId, postId, parentCommentId, placeholderId },
	rawError
) => ( dispatch, getState ) => {
	// Dispatch error notice
	const post = getSitePost( getState(), siteId, postId );
	const postTitle = post && post.title && post.title.trim().slice( 0, 20 ).trim().concat( '…' );
	const error = postTitle
		? translate( 'Could not add a reply to “%(postTitle)s”', { args: { postTitle } } )
		: translate( 'Could not add a reply to this post' );

	// Dispatch an error so we can record the failed comment placeholder in state
	dispatch( {
		type: COMMENTS_WRITE_ERROR,
		siteId,
		postId,
		commentId: placeholderId,
		parentCommentId,
		error,
		errorType: rawError && rawError.error,
	} );

	dispatch( errorNotice( error, { duration: 5000 } ) );
};
