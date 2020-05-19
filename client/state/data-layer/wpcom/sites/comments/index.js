/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { forEach, get, groupBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_LIST_REQUEST,
	COMMENT_REQUEST,
	COMMENTS_TREE_SITE_ADD,
	COMMENTS_EDIT,
} from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import replies from './replies';
import likes from './likes';
import { errorNotice, removeNotice } from 'state/notices/actions';
import getRawSite from 'state/selectors/get-raw-site';
import { getSiteComment } from 'state/comments/selectors';
import {
	changeCommentStatus,
	editComment as editCommentAction,
	receiveComments,
	receiveCommentsError as receiveCommentErrorAction,
	requestComment as requestCommentAction,
	requestCommentsList,
} from 'state/comments/actions';
import { updateCommentsQuery } from 'state/ui/comments/actions';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

import { registerHandlers } from 'state/data-layer/handler-registry';

const requestChangeCommentStatus = ( action ) => {
	const { siteId, commentId, status } = action;

	return http(
		{
			method: 'POST',
			path: `/sites/${ siteId }/comments/${ commentId }`,
			apiVersion: '1.1',
			body: {
				status,
			},
		},
		action
	);
};

export const handleChangeCommentStatusSuccess = ( { commentId, refreshCommentListQuery } ) => {
	const actions = [ removeNotice( `comment-notice-error-${ commentId }` ) ];
	if ( refreshCommentListQuery ) {
		actions.push( requestCommentsList( refreshCommentListQuery ) );
	}
	return actions;
};

const announceStatusChangeFailure = ( action ) => ( dispatch ) => {
	const { siteId, postId, commentId, status, refreshCommentListQuery } = action;
	const previousStatus = get( action, 'meta.comment.previousStatus' );

	dispatch( removeNotice( `comment-notice-${ commentId }` ) );

	dispatch(
		bypassDataLayer(
			changeCommentStatus( siteId, postId, commentId, previousStatus, refreshCommentListQuery )
		)
	);

	const errorMessage = {
		approved: translate( "We couldn't approve this comment." ),
		unapproved: translate( "We couldn't unapprove this comment." ),
		spam: translate( "We couldn't mark this comment as spam." ),
		trash: translate( "We couldn't move this comment to trash." ),
	};
	const defaultErrorMessage = translate( "We couldn't update this comment." );

	dispatch(
		errorNotice( get( errorMessage, status, defaultErrorMessage ), {
			button: translate( 'Try again' ),
			id: `comment-notice-error-${ commentId }`,
			onClick: () =>
				dispatch(
					changeCommentStatus( siteId, postId, commentId, action.status, refreshCommentListQuery )
				),
		} )
	);
};

export const requestComment = ( action ) => {
	const { siteId, commentId, query } = action;
	return http(
		Object.assign(
			{
				method: 'GET',
				path: `/sites/${ siteId }/comments/${ commentId }`,
				apiVersion: '1.1',
				query,
			},
			//if we see ?force=wpcom, on failure, retry against the real site instead.
			query.force && { retryPolicy: noRetry() }
		),
		action
	);
};

export const receiveCommentSuccess = ( action, response ) => {
	const { siteId } = action;
	const postId = response && response.post && response.post.ID;
	return receiveComments( { siteId, postId, comments: [ response ], commentById: true } );
};

export const receiveCommentError = ( { siteId, commentId, query = {} } ) => {
	// we can't tell the difference between a network failure and a shadow sync failure
	// so if the request drops out automatically retry against the real site
	const { force, ...retryQuery } = query;
	if ( force === 'wpcom' ) {
		return requestCommentAction( { siteId, commentId, query: retryQuery } );
	}
	return receiveCommentErrorAction( { siteId, commentId } );
};

// @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/
export const fetchCommentsList = ( action ) => {
	if ( 'site' !== get( action, 'query.listType' ) ) {
		return;
	}

	const { postId, siteId, status = 'unapproved', type = 'comment' } = action.query;

	const path = postId
		? `/sites/${ siteId }/posts/${ postId }/replies`
		: `/sites/${ siteId }/comments`;

	const query = {
		...omit( action.query, [ 'listType', 'postId', 'siteId' ] ),
		status,
		type,
	};

	return http(
		{
			method: 'GET',
			path,
			apiVersion: '1.1',
			query,
		},
		action
	);
};

export const addComments = ( { query }, { comments } ) => {
	const { siteId, status } = query;
	// Initialize the comments tree to let CommentList know if a tree is actually loaded and empty.
	// This is needed as a workaround for Jetpack sites populating their comments trees
	// via `fetchCommentsList` instead of `fetchCommentsTreeForSite`.
	// @see https://github.com/Automattic/wp-calypso/pull/16997#discussion_r132161699
	if ( 0 === comments.length ) {
		return [
			updateCommentsQuery( siteId, [], query ),
			{
				type: COMMENTS_TREE_SITE_ADD,
				siteId,
				status,
				tree: [],
			},
		];
	}

	const actions = [ updateCommentsQuery( siteId, comments, query ) ];

	const byPost = groupBy( comments, ( { post: { ID } } ) => ID );

	forEach( byPost, ( postComments, post ) =>
		actions.push(
			receiveComments( {
				siteId,
				postId: parseInt( post, 10 ), // keyBy => object property names are strings
				comments: postComments,
			} )
		)
	);

	return actions;
};

const announceFailure = ( { query: { siteId } } ) => ( dispatch, getState ) => {
	const site = getRawSite( getState(), siteId );
	const error =
		site && site.name
			? translate( 'Failed to retrieve comments for site “%(siteName)s”', {
					args: { siteName: site.name },
			  } )
			: translate( 'Failed to retrieve comments for your site' );

	dispatch( errorNotice( error ) );
};

// @see https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/comments/%24comment_ID/
export const editComment = ( action ) => ( dispatch, getState ) => {
	const { siteId, commentId, comment } = action;
	const originalComment = getSiteComment( getState(), siteId, commentId );

	// Comment Management allows for modifying nested fields, such as `author.name` and `author.url`.
	// Though, there is no direct match between the GET response (which feeds the state) and the POST request.
	// This ternary matches the updated fields sent by Comment Management's Edit form to the fields expected by the API.
	const body =
		comment.authorDisplayName || comment.authorUrl || comment.commentContent || comment.commentDate
			? {
					author: comment.authorDisplayName,
					author_url: comment.authorUrl,
					content: comment.commentContent,
					date: comment.commentDate,
			  }
			: comment;

	dispatch(
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/comments/${ commentId }`,
				apiVersion: '1.1',
				body,
			},
			{ ...action, originalComment }
		)
	);
};

export const updateComment = ( action, data ) => [
	removeNotice( `comment-notice-error-${ action.commentId }` ),
	bypassDataLayer( editCommentAction( action.siteId, action.postId, action.commentId, data ) ),
];

export const announceEditFailure = ( action ) => [
	bypassDataLayer(
		editCommentAction( action.siteId, action.postId, action.commentId, action.originalComment )
	),
	removeNotice( `comment-notice-${ action.commentId }` ),
	errorNotice( translate( "We couldn't update this comment." ), {
		id: `comment-notice-error-${ action.commentId }`,
	} ),
];

export const fetchHandler = {
	[ COMMENTS_CHANGE_STATUS ]: [
		dispatchRequest( {
			fetch: requestChangeCommentStatus,
			onSuccess: handleChangeCommentStatusSuccess,
			onError: announceStatusChangeFailure,
		} ),
	],
	[ COMMENTS_LIST_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchCommentsList,
			onSuccess: addComments,
			onError: announceFailure,
		} ),
	],
	[ COMMENT_REQUEST ]: [
		dispatchRequest( {
			fetch: requestComment,
			onSuccess: receiveCommentSuccess,
			onError: receiveCommentError,
		} ),
	],
	[ COMMENTS_EDIT ]: [
		dispatchRequest( {
			fetch: editComment,
			onSuccess: updateComment,
			onError: announceEditFailure,
		} ),
	],
};

registerHandlers(
	'state/data-layer/wpcom/sites/comments/index.js',
	mergeHandlers( fetchHandler, replies, likes )
);
