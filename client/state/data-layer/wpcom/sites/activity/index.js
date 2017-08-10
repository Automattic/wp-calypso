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

const KNOWN_PARAMS = [
	'action',
	'date_end',
	'date_start',
	'group',
	'name',
	'number',
];

export const handleActivityLogRequest = ( { dispatch }, action ) => {
	const { params, siteId } = action;

	if ( params.dateEnd ) {
		params.date_end = params.dateEnd;
	}

	if ( params.dateStart ) {
		params.date_start = params.dateStart;
	}

	dispatch( http( {
		apiVersion: '1',
		method: 'GET',
		path: `/sites/${ siteId }/activity`,
		query: pick( KNOWN_PARAMS, params ),
	}, action ) );
};

// FIXME: Implement fromApi
const fromApi = ( { activities } ) => activities;

export const receiveActivityLog = ( { dispatch }, { siteId }, data ) => {
	dispatch( activityLogUpdate( siteId, fromApi( data ) ) );
};

export const receiveActivityLogError = ( { dispatch }, { siteId }, error ) => {
	dispatch( activityLogError(
		siteId,
		pick( error, [ 'error', 'status', 'message' ]
	) ) );
};

export default {
	[ ACTIVITY_LOG_REQUEST ]: [ dispatchRequest(
		handleActivityLogRequest,
		receiveActivityLog,
		receiveActivityLogError
	) ],
};
