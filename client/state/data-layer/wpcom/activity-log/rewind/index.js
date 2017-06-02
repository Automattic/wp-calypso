/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_STATUS_REQUEST,
} from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const fetchRewindStatus = ( { dispatch }, action ) => {
	dispatch( http( {
		method: 'GET',
		path: `/activity-log/${ action.siteId }/rewind`,
	}, action ) );
};

const fromApi = response => ( {
	active: response.use_rewind,
	firstBackup: response.first_backup_when,
	error: { message: response.error },
} );

const updateRewindStatus = ( { dispatch }, { siteId }, next, data ) => {
	dispatch( {
		type: REWIND_STATUS_REQUEST,
		siteId,
		...fromApi( data ),
	} );
};

const rewindStatusError = ( { dispatch }, { siteId }, next, error ) => {
	dispatch( {
		type: REWIND_STATUS_REQUEST,
		siteId,
		error: pick( error, [ 'error', 'status', 'message' ] ),
		active: false,
	} );
};

export default {
	[ REWIND_STATUS_REQUEST ]: [ dispatchRequest( fetchRewindStatus, updateRewindStatus, rewindStatusError ) ],
};
