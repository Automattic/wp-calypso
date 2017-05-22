/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	USER_DEVICES_REQUEST
} from 'state/action-types';
import { userDevicesAdd } from 'state/user-devices/actions';
import { errorNotice } from 'state/notices/actions';

export const requestUserDevices = function( { dispatch } ) {
	dispatch( http( {
		apiVersion: '1.1',
		method: 'GET',
		path: '/notifications/devices',
	} ) );
};

export const handleSuccess = ( { dispatch }, action, next, devices ) => {
	dispatch( userDevicesAdd( {
		devices: keyBy( devices.map( ( { device_id, device_name } ) => ( { id: device_id, name: device_name } ) ), 'id' )
	} ) );
};

export const handleError = ( { dispatch } ) => {
	dispatch( errorNotice( translate( 'We couldn\'t load your devices, please try again.' ) ) );
};

export default {
	[ USER_DEVICES_REQUEST ]: [ dispatchRequest( requestUserDevices, handleSuccess, handleError ) ],
};
