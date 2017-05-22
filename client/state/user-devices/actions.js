/**
 * Internal dependencies
 */
import {
	USER_DEVICES_REQUEST,
	USER_DEVICES_ADD,
} from 'state/action-types';

export const requestUserDevices = () => ( { type: USER_DEVICES_REQUEST } );

export const userDevicesAdd = ( { devices } ) => ( { type: USER_DEVICES_ADD, devices } );
