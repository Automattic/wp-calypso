/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_CHANGE_STATUS_FAILURE,
	COMMENTS_CHANGE_STATUS_SUCESS,
} from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
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

const changeCommentStatusSuccess = ( { dispatch }, action ) => {
	dispatch( {
		...action,
		type: COMMENTS_CHANGE_STATUS_SUCESS,
	} );
};

const changeCommentStatusFailure = ( { dispatch, getState }, action ) => {
	const comment = getSiteComment( getState( action.siteId, action.commentId ) );
	dispatch( {
		...action,
		type: COMMENTS_CHANGE_STATUS_FAILURE,
		previousStatus: get( comment, 'status' ),
	} );
};

const changeStatusHandlers = {
	[ COMMENTS_CHANGE_STATUS ]: [ dispatchRequest( changeCommentStatus, changeCommentStatusSuccess, changeCommentStatusFailure ) ],
};

export default mergeHandlers( changeStatusHandlers );
