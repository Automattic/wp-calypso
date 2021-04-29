/**
 * Internal dependencies
 */
import 'calypso/state/user-devices/init';

/**
 * Returns the current user's devices
 *
 * @param  {object} options             options object
 * @param  {object} options.userDevices user's devices slice of the state tree
 * @returns {Array}                     current user's devices
 */
export const getUserDevices = ( { userDevices } ) => Object.values( userDevices ?? {} );

export default getUserDevices;
