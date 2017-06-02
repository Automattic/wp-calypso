/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { ACTIVITY_LOG_REQUEST } from 'state/action-types';
import {
	activityLogError,
	activityLogUpdate,
} from 'state/activity-log/actions';

const activityLogRequest = ( { dispatch }, action ) => {
	dispatch( http( {
		apiVersion: '1',
		method: 'GET',
		path: `/sites/${ action.siteId }/activity`,
	}, action ) );
};

// FIXME: Implement fromApi
const fromApi = response => response;

export const receiveActivityLog = ( { dispatch }, { siteId }, next, data ) => {
	dispatch( activityLogUpdate( siteId, fromApi( data ) ) );
};

export const receiveActivityLogError = ( { dispatch }, { siteId }, next, error ) => {
	dispatch( activityLogError(
		siteId,
		pick( error, [ 'error', 'status', 'message' ]
	) ) );
};

export default {
	[ ACTIVITY_LOG_REQUEST ]: [ dispatchRequest(
		activityLogRequest,
		activityLogUpdate,
		activityLogError,
	) ],
};
