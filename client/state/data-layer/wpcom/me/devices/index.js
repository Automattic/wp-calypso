/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	USER_DEVICES_REQUEST
} from 'state/action-types';
import {
	userDevicesRequestSuccess,
	userDevicesRequestFailure,
} from 'state/user-devices/actions';

export const requestUserDevices = function( { dispatch }, action, next ) {
	dispatch( http( {
		apiVersion: '1.1',
		method: 'GET',
		path: '/notifications/devices',
	}, action ) );

	return next( action );
};

export const handleSuccess = ( { dispatch }, action, next, devices ) => {
	dispatch( userDevicesRequestSuccess( { devices } ) );
};

export const handleError = ( { dispatch }, action, next, error ) => {
	dispatch( userDevicesRequestFailure( error ) );
};

export default {
	[ USER_DEVICES_REQUEST ]: [ dispatchRequest( requestUserDevices, handleSuccess, handleError ) ],
};
