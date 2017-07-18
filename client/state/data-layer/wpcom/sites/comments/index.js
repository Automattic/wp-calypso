/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { forEach, groupBy } from 'lodash';

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { COMMENTS_LIST_REQUEST, COMMENTS_RECEIVE, COMMENT_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import replies from './replies';
import likes from './likes';
import { errorNotice } from 'state/notices/actions';
import { getRawSite } from 'state/sites/selectors';
import { getSiteName as getReaderSiteName } from 'reader/get-helpers';
import { getSite as getReaderSite } from 'state/reader/sites/selectors';

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

export const receiveCommentSuccess = ( store, action, next, response ) => {
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

export const receiveCommentError = ( store, action ) => {
	const site = getReaderSite( store.getState(), action.siteId );
	const siteName = getReaderSiteName( { site } );

	store.dispatch(
		errorNotice(
			translate( 'Failed to retrieve comment for site “%(siteName)s”', {
				args: { siteName },
			} ),
		),
	);
};

// @see https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/comments/
export const fetchCommentsList = ( { dispatch }, action ) => {
	const { query } = action;

	if ( ! query || 'site' !== query.listType ) {
		return;
	}

	const { siteId, status = 'unapproved', type = 'comment' } = query;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/comments`,
				apiVersion: '1.1',
				query: {
					status,
					type,
				},
			},
			action,
		),
	);
};

export const addComments = ( { dispatch }, { query: { siteId } }, next, { comments } ) => {
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

const fetchHandler = {
	[ COMMENTS_LIST_REQUEST ]: [ dispatchRequest( fetchCommentsList, addComments, announceFailure ) ],
	[ COMMENT_REQUEST ]: [
		dispatchRequest( requestComment, receiveCommentSuccess, receiveCommentError ),
	],
};

export default mergeHandlers( fetchHandler, replies, likes );
