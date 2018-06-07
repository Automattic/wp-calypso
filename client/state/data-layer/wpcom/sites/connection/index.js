/** @format */

/**
 * Internal dependencies
 */
import { convertToCamelCase } from 'state/data-layer/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { SITE_CONNECTION_STATUS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveConnectionStatus, errorConnectionStatus } from 'state/sites/connection/actions';

export const fromApi = data => convertToCamelCase( data );

export const fetchConnectionStatus = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				path: `/jetpack-blogs/${ action.siteId }/test-connection`,
				method: 'GET',
			},
			action
		)
	);
};

/**
 * Dispatches returned status connection
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Array} data raw data from jetpack test connection API
 */
export const handleSuccess = ( { dispatch }, action, data ) => {
	dispatch( receiveConnectionStatus( action.siteId, fromApi( data ) ) );
};

/**
 * Dispatches a failure to retrieve stats
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Object} error raw error from jetpack test connection API
 */
export const handleError = ( { dispatch }, action, error ) => {
	dispatch( errorConnectionStatus( action.siteId, error ) );
};

export default {
	[ SITE_CONNECTION_STATUS_REQUEST ]: [
		dispatchRequest( fetchConnectionStatus, handleSuccess, handleError ),
	],
};
