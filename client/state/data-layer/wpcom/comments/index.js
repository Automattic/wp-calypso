/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { compact, get, isDate, startsWith, pickBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_REQUEST,
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_DELETE,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';
import { requestCommentsList } from 'state/comments/actions';
import { getPostOldestCommentDate, getPostNewestCommentDate } from 'state/comments/selectors';
import getSiteComment from 'state/selectors/get-site-comment';
import { decodeEntities } from 'lib/formatting';

export const commentsFromApi = comments =>
	map(
		comments,
		comment =>
			comment.author
				? {
						...comment,
						author: {
							...comment.author,
							name: decodeEntities( get( comment, [ 'author', 'name' ] ) ),
						},
					}
				: comment
	);

// @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/replies/
export const fetchPostComments = action => ( dispatch, getState ) => {
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
			action
		)
	);
};

export const addComments = ( action, { comments, found } ) => {
	const { siteId, postId, direction } = action;
	const receiveAction = {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments: commentsFromApi( comments ),
		direction,
	};

	// if the api have returned comments count, dispatch it
	// the api will produce a count only when the request has no
	// query modifiers such as 'before', 'after', 'type' and more.
	// in our case it'll be only on the first request
	if ( found > -1 ) {
		return [
			receiveAction,
			{
				type: COMMENTS_COUNT_RECEIVE,
				siteId,
				postId,
				totalCommentsCount: found,
			},
		];
	}

	return receiveAction;
};

export const announceFailure = ( { siteId, postId } ) => ( dispatch, getState ) => {
	const post = getSitePost( getState(), siteId, postId );
	const postTitle =
		post &&
		post.title &&
		post.title
			.trim()
			.slice( 0, 20 )
			.trim()
			.concat( '…' );
	const error = postTitle
		? translate( 'Could not retrieve comments for “%(postTitle)s”', { args: { postTitle } } )
		: translate( 'Could not retrieve comments for requested post' );

	dispatch( errorNotice( error ) );
};

// @see https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/comments/%24comment_ID/delete/
export const deleteComment = action => ( dispatch, getState ) => {
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

export const handleDeleteSuccess = ( { options, refreshCommentListQuery } ) => {
	const showSuccessNotice = get( options, 'showSuccessNotice', false );

	return compact( [
		showSuccessNotice &&
			successNotice( translate( 'Comment deleted permanently.' ), {
				duration: 5000,
				id: 'comment-notice',
				isPersistent: true,
			} ),
		!! refreshCommentListQuery && requestCommentsList( refreshCommentListQuery ),
	] );
};

export const announceDeleteFailure = action => {
	const { siteId, postId, comment } = action;

	const error = errorNotice( translate( 'Could not delete the comment.' ), {
		duration: 5000,
		isPersistent: true,
	} );

	if ( ! comment ) {
		return error;
	}

	return [
		error,
		{
			type: COMMENTS_RECEIVE,
			siteId,
			postId,
			comments: [ comment ],
			skipSort: !! get( comment, 'parent.ID' ),
			meta: {
				comment: {
					context: 'add', //adds a hint for the counts reducer.
				},
			},
		},
	];
};

export default {
	[ COMMENTS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchPostComments,
			onSuccess: addComments,
			onError: announceFailure,
		} ),
	],
	[ COMMENTS_DELETE ]: [
		dispatchRequestEx( {
			fetch: deleteComment,
			onSuccess: handleDeleteSuccess,
			onError: announceDeleteFailure,
		} ),
	],
};
