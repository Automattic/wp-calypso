/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_CHANGE_STATUS } from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { local } from 'state/data-layer/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, removeNotice } from 'state/notices/actions';
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

const announceFailure = ( { dispatch, getState }, action ) => {
	const { commentId, status, previousStatus } = action;

	dispatch( removeNotice( `comment-notice-${ action.commentId }` ) );

	dispatch(
		local( {
			...action,
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
		id: `comment-notice-${ commentId }`,
		onClick: () => dispatch( action ),
	} ) );
};

const changeStatusHandlers = {
	[ COMMENTS_CHANGE_STATUS ]: [ dispatchRequest( changeCommentStatus, verifyCommentStatus, announceFailure ) ],
};

export default mergeHandlers( changeStatusHandlers );
