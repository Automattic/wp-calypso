/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import { get, includes, pick, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import fromApi from './from-api';
import { ACTIVITY_LOG_REQUEST } from 'state/action-types';
import { activityLogError, activityLogUpdate } from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

/**
 * Module constants
 */
const debug = debugFactory( 'calypso:data-layer:activity' );
const CALYPSO_TO_API_PARAMS = {
	dateEnd: 'date_end',
	dateStart: 'date_start',
};
const KNOWN_API_PARAMS = [ 'action', 'date_end', 'date_start', 'group', 'name', 'number' ];

export const handleActivityLogRequest = ( { dispatch }, action ) => {
	const { siteId } = action;

	const query = reduce(
		action.params,
		( acc, value, param ) => {
			const paramToStore = get( CALYPSO_TO_API_PARAMS, param, param );

			if ( includes( KNOWN_API_PARAMS, paramToStore ) ) {
				return {
					...acc,
					[ paramToStore ]: value,
				};
			}

			return acc;
		},
		{}
	);

	debug( 'Handling activity request', query );

	// Clear current logs, this will allow loading placeholders to appear
	dispatch( activityLogUpdate( siteId, undefined ) );

	dispatch(
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/activity`,
				query,
			},
			action
		)
	);
};

export const receiveActivityLog = ( { dispatch }, action, data ) => {
	dispatch( activityLogUpdate( action.siteId, data, data.totalItems, action.params ) );
};

export const receiveActivityLogError = ( { dispatch }, { siteId }, error ) => {
	dispatch( activityLogError( siteId, pick( error, [ 'error', 'status', 'message' ] ) ) );
};

export default {
	[ ACTIVITY_LOG_REQUEST ]: [
		dispatchRequest( handleActivityLogRequest, receiveActivityLog, receiveActivityLogError, {
			fromApi,
		} ),
	],
};
