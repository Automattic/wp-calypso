/**
 * Internal dependencies
 */
import {
	USER_DEVICES_REQUEST,
	USER_DEVICES_REQUEST_FAILURE,
	USER_DEVICES_REQUEST_SUCCESS,
} from 'state/action-types';

export const requestUserDevices = () => ( { type: USER_DEVICES_REQUEST } );

export const userDevicesRequestSuccess = ( { devices } ) => ( { type: USER_DEVICES_REQUEST_SUCCESS, devices } );

export const userDevicesRequestFailure = () => ( { type: USER_DEVICES_REQUEST_FAILURE } );
