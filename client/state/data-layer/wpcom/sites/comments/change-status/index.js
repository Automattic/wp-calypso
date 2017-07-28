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
import { errorNotice } from 'state/notices/actions';
import { getSiteComment } from 'state/selectors';

const changeCommentStatus = ( { dispatch, getState }, action ) => {
	const { siteId, commentId, status } = action;
	const comment = getSiteComment( getState(), action.siteId, action.commentId );

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
				previousStatus: get( comment, 'status' ),
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
	dispatch(
		local( {
			...action,
			status: action.previousStatus,
		} )
	);
	dispatch( errorNotice( translate( 'Could not update the comment' ) ) );
};

const changeStatusHandlers = {
	[ COMMENTS_CHANGE_STATUS ]: [ dispatchRequest( changeCommentStatus, verifyCommentStatus, announceFailure ) ],
};

export default mergeHandlers( changeStatusHandlers );
