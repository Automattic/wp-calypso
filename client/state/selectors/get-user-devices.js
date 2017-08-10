/** @format */
/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Returns the current user's devices
 *
 * @param  {Object} userDevices user's devices slice of the state tree
 * @return {Array}              current user's devices
 */
export const getUserDevices = ( { userDevices } ) => values( userDevices );

export default getUserDevices;
