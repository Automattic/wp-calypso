/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, isDate, startsWith, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_REQUEST, COMMENTS_RECEIVE, COMMENTS_COUNT_INCREMENT, COMMENTS_COUNT_RECEIVE, COMMENTS_DELETE } from 'state/action-types';
import { getPostOldestCommentDate, getPostNewestCommentDate } from 'state/comments/selectors';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';
import getSiteComment from 'state/selectors/get-site-comment';

/***
 * Creates a placeholder comment for a given text and postId
 * @param {String} commentText text of the comment
 * @param {Number} postId post identifier
 * @param {Number|undefined} parentCommentId parent comment identifier
 * @returns {Object} comment placeholder
 */
export function createPlaceholderComment( commentText, postId, parentCommentId ) {
	// We need placehodler id to be unique in the context of siteId, postId for that specific user,
	// date milliseconds will do for that purpose.
	return {
		ID: 'placeholder-' + new Date().getTime(),
		parent: parentCommentId ? { ID: parentCommentId } : false,
		date: new Date().toISOString(),
		content: commentText,
		status: 'pending',
		type: 'comment',
		post: {
			ID: postId,
		},
		isPlaceholder: true,
		placeholderState: 'PENDING',
	};
}

// @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/replies/
export const fetchPostComments = ( { dispatch, getState }, action ) => {
	const { siteId, postId, query, direction } = action;
	const oldestDate = getPostOldestCommentDate( getState(), siteId, postId );
	const newestDate = getPostNewestCommentDate( getState(), siteId, postId );

	const before =
		direction === 'before' &&
		isDate( oldestDate ) &&
		oldestDate.toISOString &&
		oldestDate.toISOString();

	const after =
		direction === 'after' &&
		isDate( newestDate ) &&
		newestDate.toISOString &&
		newestDate.toISOString();

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/posts/${ postId }/replies`,
				apiVersion: '1.1',
				query: pickBy( {
					...query,
					after,
					before,
				} ),
			},
			action,
		),
	);
};

export const writePostComment = ( { dispatch }, action ) => {
	const { siteId, postId, parentCommentId, commentText } = action;
	const placeholder = createPlaceholderComment( commentText, postId, parentCommentId );

	// Insert a placeholder
	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments: [ placeholder ],
		skipSort: !! parentCommentId,
	} );

	const path = !! parentCommentId
		? `/sites/${ siteId }/comments/${ parentCommentId }/replies/new`
		: `/sites/${ siteId }/posts/${ postId }/replies/new`;

	dispatch(
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
			onFailure: action,
		} ),
	);
};

export const addComments = ( { dispatch }, action, { comments, found } ) => {
	const { siteId, postId, direction } = action;
	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments,
		direction,
	} );

	// if the api have returned comments count, dispatch it
	// the api will produce a count only when the request has no
	// query modifiers such as 'before', 'after', 'type' and more.
	// in our case it'll be only on the first request
	if ( found > -1 ) {
		dispatch( {
			type: COMMENTS_COUNT_RECEIVE,
			siteId,
			postId,
			totalCommentsCount: found,
		} );
	}
};

export const writePostCommentSuccess = (
	{ dispatch },
	{ siteId, postId, parentCommentId, placeholderId },
	comment,
) => {
	// remove placeholder from state
	dispatch( { type: COMMENTS_DELETE, siteId, postId, commentId: placeholderId } );
	// add new comment to state with updated values from server
	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments: [ comment ],
		skipSort: !! parentCommentId,
	} );
	// increment comments count
	dispatch( { type: COMMENTS_COUNT_INCREMENT, siteId, postId } );
};

export const announceFailure = ( { dispatch, getState }, { siteId, postId } ) => {
	const post = getSitePost( getState(), siteId, postId );
	const postTitle = post && post.title && post.title.trim().slice( 0, 20 ).trim().concat( '…' );
	const error = postTitle
		? translate( 'Could not retrieve comments for “%(postTitle)s”', { args: { postTitle } } )
		: translate( 'Could not retrieve comments for requested post' );

	dispatch( errorNotice( error ) );
};

// @see https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/comments/%24comment_ID/delete/
export const deleteComment = ( { dispatch, getState }, action ) => {
	const { siteId, commentId } = action;

	if ( startsWith( commentId, 'placeholder' ) ) {
		return;
	}

	const comment = getSiteComment( getState(), siteId, commentId );

	dispatch(
		http(
			{
				method: 'POST',
				apiVersion: '1.1',
				path: `/sites/${ siteId }/comments/${ commentId }/delete`,
			},
			{
				...action,
				comment,
			}
		)
	);
};

export const announceDeleteSuccess = ( { dispatch }, { options } ) => {
	const showSuccessNotice = get( options, 'showSuccessNotice', false );
	if ( ! showSuccessNotice ) {
		return;
	}

	dispatch(
		successNotice(
			translate( 'Comment deleted permanently.' ),
			{
				duration: 5000,
				isPersistent: true,
			}
		)
	);
};

export const announceDeleteFailure = ( { dispatch }, action ) => {
	const { siteId, postId, comment } = action;

	dispatch(
		errorNotice(
			translate( 'Could not delete the comment.' ),
			{
				duration: 5000,
				isPersistent: true,
			}
		)
	);

	if ( comment ) {
		dispatch( {
			type: COMMENTS_RECEIVE,
			siteId,
			postId,
			comments: [ comment ],
			skipSort: !! get( comment, 'parent.ID' ),
		} );
	}
};

export default {
	[ COMMENTS_REQUEST ]: [ dispatchRequest( fetchPostComments, addComments, announceFailure ) ],
	[ COMMENTS_DELETE ]: [ dispatchRequest( deleteComment, announceDeleteSuccess, announceDeleteFailure ) ],
};
