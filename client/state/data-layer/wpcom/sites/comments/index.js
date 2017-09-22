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
	COMMENTS_RECEIVE,
	COMMENT_REQUEST,
	COMMENTS_ERROR,
	COMMENTS_TREE_SITE_ADD,
	COMMENTS_EDIT,
} from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import replies from './replies';
import likes from './likes';
import { errorNotice, removeNotice } from 'state/notices/actions';
import { getRawSite } from 'state/sites/selectors';
import { getSiteComment } from 'state/selectors';
import { getSiteName as getReaderSiteName } from 'reader/get-helpers';
import { getSite as getReaderSite } from 'state/reader/sites/selectors';

const changeCommentStatus = ( { dispatch, getState }, action ) => {
	const { siteId, commentId, status } = action;
	const previousStatus = get( getSiteComment( getState(), action.siteId, action.commentId ), 'status' );

	dispatch(
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/comments/${ commentId }`,
				apiVersion: '1.1',
				body: {
					status,
				},
			},
			{
				...action,
				previousStatus,
			}
		)
	);
};

export const removeCommentStatusErrorNotice = ( { dispatch }, { commentId } ) =>
	dispatch( removeNotice( `comment-notice-error-${ commentId }` ) );

const announceStatusChangeFailure = ( { dispatch }, action ) => {
	const { commentId, status, previousStatus } = action;

	dispatch( removeNotice( `comment-notice-${ commentId }` ) );

	dispatch(
		bypassDataLayer( {
			...omit( action, [ 'meta' ] ),
			status: previousStatus,
		} )
	);

	const errorMessage = {
		approved: translate( "We couldn't approve this comment." ),
		unapproved: translate( "We couldn't unapprove this comment." ),
		spam: translate( "We couldn't mark this comment as spam." ),
		trash: translate( "We couldn't move this comment to trash." ),
	};
	const defaultErrorMessage = translate( "We couldn't update this comment." );

	dispatch( errorNotice( get( errorMessage, status, defaultErrorMessage ), {
		button: translate( 'Try again' ),
		id: `comment-notice-error-${ commentId }`,
		onClick: () => dispatch( omit( action, [ 'meta' ] ) ),
	} ) );
};

export const requestComment = ( store, action ) => {
	const { siteId, commentId } = action;
	store.dispatch(
		http( {
			method: 'GET',
			path: `/sites/${ siteId }/comments/${ commentId }`,
			apiVersion: '1.1',
			onSuccess: action,
			onFailure: action,
		} ),
	);
};

export const receiveCommentSuccess = ( store, action, response ) => {
	const { siteId } = action;
	const postId = response && response.post && response.post.ID;
	store.dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments: [ response ],
		commentById: true,
	} );
};

export const receiveCommentError = ( { dispatch, getState }, { siteId, commentId } ) => {
	const site = getReaderSite( getState(), siteId );
	const siteName = getReaderSiteName( { site } );

	if ( siteName ) {
		dispatch(
			errorNotice(
				translate( 'Failed to retrieve comment for site “%(siteName)s”', {
					args: { siteName },
				} ),
				{ id: `request-comment-error-${ siteId }` }
			)
		);
	} else {
		const rawSite = getRawSite( getState(), siteId );
		const error =
			rawSite && rawSite.name
				? translate( 'Failed to retrieve comment for site “%(siteName)s”', {
					args: { siteName: rawSite.name },
				} )
				: translate( 'Failed to retrieve comment for your site' );

		dispatch( errorNotice( error, { id: `request-comment-error-${ siteId }` } ) );
	}

	dispatch( {
		type: COMMENTS_ERROR,
		siteId,
		commentId,
	} );
};

// @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/
export const fetchCommentsList = ( { dispatch }, action ) => {
	if ( 'site' !== get( action, 'query.listType' ) ) {
		return;
	}

	const { siteId, status = 'unapproved', type = 'comment' } = action.query;

	const query = {
		...omit( action.query, [ 'listType', 'siteId' ] ),
		status,
		type,
	};

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/comments`,
				apiVersion: '1.1',
				query,
			},
			action,
		),
	);
};

export const addComments = ( { dispatch }, { query: { siteId, status } }, { comments } ) => {
	// Initialize the comments tree to let CommentList know if a tree is actually loaded and empty.
	// This is needed as a workaround for Jetpack sites populating their comments trees
	// via `fetchCommentsList` instead of `fetchCommentsTreeForSite`.
	// @see https://github.com/Automattic/wp-calypso/pull/16997#discussion_r132161699
	if ( 0 === comments.length ) {
		dispatch( {
			type: COMMENTS_TREE_SITE_ADD,
			siteId,
			status,
			tree: [],
		} );
		return;
	}

	const byPost = groupBy( comments, ( { post: { ID } } ) => ID );

	forEach( byPost, ( postComments, postId ) =>
		dispatch( {
			type: COMMENTS_RECEIVE,
			siteId,
			postId: parseInt( postId, 10 ), // keyBy => object property names are strings
			comments: postComments,
		} ),
	);
};

const announceFailure = ( { dispatch, getState }, { query: { siteId } } ) => {
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
export const editComment = ( { dispatch, getState }, action ) => {
	const { siteId, commentId, comment } = action;
	const originalComment = getSiteComment( getState(), action.siteId, action.commentId );

	// Comment Management allows for modifying nested fields, such as `author.name` and `author.url`.
	// Though, there is no direct match between the GET response (which feeds the state) and the POST request.
	// This ternary matches the updated fields sent by Comment Management's Edit form to the fields expected by the API.
	const body = ( comment.authorDisplayName || comment.authorUrl || comment.commentContent )
		? {
			author: comment.authorDisplayName,
			author_url: comment.authorUrl,
			content: comment.commentContent,
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
			{
				...action,
				originalComment,
			}
		)
	);
};

export const updateComment = ( store, action, data ) => {
	removeCommentStatusErrorNotice( store, action );
	store.dispatch(
		bypassDataLayer( {
			...omit( action, [ 'originalComment' ] ),
			comment: data,
		} )
	);
};

export const announceEditFailure = ( { dispatch }, action ) => {
	dispatch(
		bypassDataLayer( {
			...omit( action, [ 'originalComment' ] ),
			comment: action.originalComment,
		} )
	);
	dispatch( removeNotice( `comment-notice-${ action.commentId }` ) );
	dispatch( errorNotice( translate( "We couldn't update this comment." ), {
		id: `comment-notice-error-${ action.commentId }`,
	} ) );
};

export const fetchHandler = {
	[ COMMENTS_CHANGE_STATUS ]: [ dispatchRequest( changeCommentStatus, removeCommentStatusErrorNotice, announceStatusChangeFailure ) ],
	[ COMMENTS_LIST_REQUEST ]: [ dispatchRequest( fetchCommentsList, addComments, announceFailure ) ],
	[ COMMENT_REQUEST ]: [ dispatchRequest( requestComment, receiveCommentSuccess, receiveCommentError ) ],
	[ COMMENTS_EDIT ]: [ dispatchRequest( editComment, updateComment, announceEditFailure ) ],
};

export default mergeHandlers( fetchHandler, replies, likes );
