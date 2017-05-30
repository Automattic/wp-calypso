/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * Returns a boolean signifying whether there are user devices or not
 *
 * @param  {Object} userDevices user's devices slice of the state tree
 * @return {Boolean}            true if the user has devices
 */
export const hasUserSettings = ( { userDevices } ) => ! isEmpty( userDevices );

export default hasUserSettings;
