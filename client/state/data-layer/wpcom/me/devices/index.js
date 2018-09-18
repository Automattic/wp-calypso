/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { USER_DEVICES_REQUEST } from 'state/action-types';
import { userDevicesAdd } from 'state/user-devices/actions';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const devicesFromApi = devices =>
	keyBy(
		devices.map( ( { device_id, device_name } ) => ( { id: device_id, name: device_name } ) ),
		'id'
	);

/**
 * Returns an action for HTTP request to fetch all available WordPress.com plans
 *
 * @param   {Object} action Redux action
 * @returns {Object} http request action
 */
export const requestUserDevices = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/notifications/devices',
		},
		action
	);

/**
 * Returns a user devices add action then the request for user devices succeeded.
 *
 * @param   {Object}   action   Redux action
 * @param   {Object}   devices  Devices, returned from the endpoint
 * @returns {Object}            User devices add action
 */
export const handleSuccess = ( action, devices ) => userDevicesAdd( devices );

/**
 * Returns an error notice action when the request for user devices fails
 *
 * @returns {Object}            Error notice action
 */
export const handleError = () =>
	errorNotice( translate( "We couldn't load your devices, please try again." ) );

registerHandlers( 'state/data-layer/wpcom/me/devices/index.js', {
	[ USER_DEVICES_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestUserDevices,
			onSuccess: handleSuccess,
			onError: handleError,
			fromApi: devicesFromApi,
		} ),
	],
} );

export default {};
