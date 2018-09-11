/** @format */

/**
 * Internal dependencies
 */

import { USER_DEVICES_REQUEST, USER_DEVICES_ADD } from 'state/action-types';

import 'state/data-layer/wpcom/me/devices';

/**
 * Returns an action object to signal the request of the user's devices.
 * @returns {Object} Action object
 */
export const requestUserDevices = () => ( { type: USER_DEVICES_REQUEST } );

/**
 * Returns an action object signalling the adittion of devices to the store.
 *
 * @param  {Object} devices Object containing one or more devices, keyed by id.
 * @return {Object}         Action object
 */
export const userDevicesAdd = devices => ( { type: USER_DEVICES_ADD, devices } );
