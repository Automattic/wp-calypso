/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import restoreStatusHandler from './restore-status';
import restoreHandler from './to';
import { REWIND_STATUS_REQUEST } from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { rewindStatusError, updateRewindStatus } from 'state/activity-log/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

const fetchRewindStatus = ( { dispatch }, action ) => {
	dispatch( http( {
		method: 'GET',
		path: `/activity-log/${ action.siteId }/rewind`,
		apiVersion: '1',
	}, action ) );
};

const fromApi = response => ( {
	active: Boolean( response.use_rewind ),
	firstBackupDate: response.first_backup_when,
	isPressable: Boolean( response.is_pressable ),
	plan: response.plan,
} );

export const receiveRewindStatus = ( { dispatch }, { siteId }, data ) => {
	dispatch( updateRewindStatus( siteId, fromApi( data ) ) );
};

export const receiveRewindStatusError = ( { dispatch }, { siteId }, error ) => {
	dispatch( rewindStatusError(
		siteId,
		pick( error, [ 'error', 'status', 'message' ] )
	) );
};

const statusHandler = {
	[ REWIND_STATUS_REQUEST ]: [ dispatchRequest(
		fetchRewindStatus,
		receiveRewindStatus,
		receiveRewindStatusError
	) ],
};

export default mergeHandlers(
	restoreHandler,
	restoreStatusHandler,
	statusHandler
);
