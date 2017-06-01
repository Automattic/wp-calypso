/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	REWIND_STATUS_REQUEST,
} from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const fetchStatus = ( { dispatch }, action ) => {
	dispatch( http( {
		method: 'GET',
		path: `/activity-log/${ action.siteId }/rewind`,
	}, action ) );
};

const addStatus = ( { dispatch }, { siteId }, next, { data } ) => {
	next( {
		type: REWIND_STATUS_REQUEST,
		siteId,
		data,
	} );
};

export default {
	[ REWIND_STATUS_REQUEST ]: [ dispatchRequest( fetchStatus, addStatus, noop ) ],
};
