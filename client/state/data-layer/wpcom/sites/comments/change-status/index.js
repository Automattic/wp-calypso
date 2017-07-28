/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { stripHTML, decodeEntities } from 'lib/formatting';
import { COMMENTS_CHANGE_STATUS } from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { local } from 'state/data-layer/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { getSiteComment } from 'state/selectors';

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

const verifyCommentStatus = ( { dispatch, getState }, action, next, data ) => {
	const statusFromState = get( getSiteComment( getState(), action.siteId, action.commentId ), 'status' );
	const statusFromServer = get( data, 'status' );

	if ( statusFromServer && statusFromServer !== statusFromState ) {
		dispatch(
			local( {
				...action,
				status: get( data, 'status' ),
			} )
		);
	}
};

const getErrorMessage = ( status, content ) => {
	const commentContent = content && truncate( decodeEntities( stripHTML( content ) ), { length: 30, omission: '…' } );

	switch ( status ) {
		case 'approved':
			return commentContent
				? translate( 'Could not approve the comment "%(commentContent)s".', { args: { commentContent } } )
				: translate( 'Could not approve the comment.' );
		case 'unapproved':
			return commentContent
				? translate( 'Could not unapprove the comment "%(commentContent)s".', { args: { commentContent } } )
				: translate( 'Could not unapprove the comment.' );
		case 'spam':
			return commentContent
				? translate( 'Could not mark the comment "%(commentContent)s" as spam.', { args: { commentContent } } )
				: translate( 'Could not mark the comment as spam.' );
		case 'trash':
			return commentContent
				? translate( 'Could not move the comment "%(commentContent)s" to trash.', { args: { commentContent } } )
				: translate( 'Could not move the comment to trash.' );
		default:
			return commentContent
				? translate( 'Could not update the comment "%(commentContent)s".', { args: { commentContent } } )
				: translate( 'Could not update the comment.' );
	}
};

const announceFailure = ( { dispatch, getState }, action ) => {
	dispatch(
		local( {
			...action,
			status: action.previousStatus,
		} )
	);

	const content = get( getSiteComment( getState(), action.siteId, action.commentId ), 'content' );
	dispatch( errorNotice( getErrorMessage( action.status, content ) ) );
};

const changeStatusHandlers = {
	[ COMMENTS_CHANGE_STATUS ]: [ dispatchRequest( changeCommentStatus, verifyCommentStatus, announceFailure ) ],
};

export default mergeHandlers( changeStatusHandlers );
