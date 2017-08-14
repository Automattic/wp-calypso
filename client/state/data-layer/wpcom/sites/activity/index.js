/** @format */
/**
 * External dependencies
 */
import { get, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { ACTIVITY_LOG_REQUEST } from 'state/action-types';
import { activityLogError, activityLogUpdate } from 'state/activity-log/actions';

const KNOWN_PARAMS = [ 'action', 'date_end', 'date_start', 'group', 'name', 'number' ];

export const handleActivityLogRequest = ( { dispatch }, action ) => {
	const { siteId } = action;

	const query = pick( action.params, KNOWN_PARAMS );

	const dateEnd = get( action.params, 'dateEnd' );
	if ( dateEnd ) {
		query.date_end = dateEnd;
	}

	const dateStart = get( action.params, 'dateStart' );
	if ( dateStart ) {
		query.date_start = dateStart;
	}

	dispatch(
		http(
			{
				apiVersion: '1',
				method: 'GET',
				path: `/sites/${ siteId }/activity`,
				query,
			},
			action
		)
	);
};

// FIXME: Implement fromApi
const fromApi = ( { activities } ) => activities;

export const receiveActivityLog = ( { dispatch }, { siteId }, data ) => {
	dispatch( activityLogUpdate( siteId, fromApi( data ) ) );
};

export const receiveActivityLogError = ( { dispatch }, { siteId }, error ) => {
	dispatch( activityLogError( siteId, pick( error, [ 'error', 'status', 'message' ] ) ) );
};

export default {
	[ ACTIVITY_LOG_REQUEST ]: [
		dispatchRequest( handleActivityLogRequest, receiveActivityLog, receiveActivityLogError ),
	],
};
