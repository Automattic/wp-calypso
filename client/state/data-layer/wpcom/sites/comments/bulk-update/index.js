/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { each, filter, get, includes, map } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_BULK_CHANGE_STATUS } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { changeCommentStatus, requestCommentsList } from 'state/comments/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';

const bulkChangeCommentStatus = action => {
	const { comments, siteId, status } = action;
	const commentIds = map( comments, 'commentId' );
	return http(
		{
			method: 'POST',
			path: `/sites/${ siteId }/comments/bulk-update-status`,
			apiVersion: '1',
			body: {
				comment_ids: commentIds,
				status,
			},
		},
		action
	);
};

const handleBulkChangeCommentStatusSuccess = (
	{ comments, siteId, status, refreshCommentListQuery },
	{ results }
) => dispatch => {
	if ( !! refreshCommentListQuery ) {
		dispatch( requestCommentsList( refreshCommentListQuery ) );
	}

	dispatch( removeNotice( 'comment-notice-bulk-error' ) );

	const updatedComments = filter( comments, ( { commentId } ) => includes( results, commentId ) );
	each( updatedComments, ( { commentId, postId } ) =>
		dispatch( bypassDataLayer( changeCommentStatus( siteId, postId, commentId, status ) ) )
	);

	const message = get(
		{
			approved: translate( 'All selected comments approved.' ),
			unapproved: translate( 'All selected comments unapproved.' ),
			pending: translate( 'All selected comments unapproved.' ),
			spam: translate( 'All selected comments marked as spam.' ),
			trash: translate( 'All selected comments moved to trash.' ),
		},
		status
	);
	dispatch(
		successNotice( message, {
			id: 'comment-notice-bulk',
			isPersistent: true,
		} )
	);
};

const handleBulkChangeCommentStatusError = ( { status } ) => dispatch => {
	dispatch( removeNotice( 'comment-notice-bulk' ) );
	const message = get(
		{
			approved: translate( "We couldn't approve the selected comments." ),
			unapproved: translate( "We couldn't unapprove the selected comments." ),
			pending: translate( "We couldn't unapprove the selected comments." ),
			spam: translate( "We couldn't mark the selected comments as spam." ),
			trash: translate( "We couldn't move the selected comments to trash." ),
		},
		status
	);
	dispatch( errorNotice( message, { id: 'comment-notice-bulk-error' } ) );
};

export default {
	[ COMMENTS_BULK_CHANGE_STATUS ]: [
		dispatchRequestEx( {
			fetch: bulkChangeCommentStatus,
			onSuccess: handleBulkChangeCommentStatusSuccess,
			onError: handleBulkChangeCommentStatusError,
		} ),
	],
};
