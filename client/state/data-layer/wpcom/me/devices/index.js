/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { USER_DEVICES_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { userDevicesAdd } from 'state/user-devices/actions';

const devicesFromApi = devices => keyBy( devices.map(
	( { device_id, device_name } ) => ( { id: device_id, name: device_name } )
), 'id' );

/**
 * Dispatches a request to fetch all available WordPress.com plans
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object} dispatched http action
 */
export const requestUserDevices = ( { dispatch }, action ) => dispatch( http( {
	apiVersion: '1.1',
	method: 'GET',
	path: '/notifications/devices',
}, action ) );

/**
 * Dispatches a user devices add action then the request for user devices succeeded.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Array}    devices  array of raw device data returned from the endpoint
 * @returns {Object}            disparched user devices add action
 */
export const handleSuccess = ( { dispatch }, action, devices ) => dispatch( userDevicesAdd( {
	devices: devicesFromApi( devices )
} ) );

/**
 * Dispatches a error notice action when the request for user devices fails
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object}            dispatched error notice action
 */
export const handleError = ( { dispatch } ) => dispatch(
	errorNotice( translate( 'We couldn\'t load your devices, please try again.' ) )
);

export default {
	[ USER_DEVICES_REQUEST ]: [ dispatchRequest( requestUserDevices, handleSuccess, handleError ) ],
};
