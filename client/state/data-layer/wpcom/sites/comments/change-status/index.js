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
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { getSiteComment } from 'state/selectors';

const changeCommentStatus = ( { dispatch }, action ) => {
	const { siteId, commentId, status } = action;

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
			action
		)
	);
};

const changeCommentStatusSuccess = ( { dispatch }, action, next, data ) => {
	dispatch( {
		...action,
		status: get( data, 'status' ),
	} );
};

const announceFailure = ( { dispatch, getState }, action ) => {
	const comment = getSiteComment( getState( action.siteId, action.commentId ) );
	dispatch( {
		...action,
		status: get( comment, 'status' ),
	} );
	dispatch( errorNotice( translate( 'Could not update the comment' ) ) );
};

const changeStatusHandlers = {
	[ COMMENTS_CHANGE_STATUS ]: [ dispatchRequest( changeCommentStatus, changeCommentStatusSuccess, announceFailure ) ],
};

export default mergeHandlers( changeStatusHandlers );
