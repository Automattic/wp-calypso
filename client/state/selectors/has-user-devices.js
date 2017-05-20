/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * Returns a boolean signifying whether there are user devices or not
 *
 * @param  {Object} state Global state tree
 * @return {Boolean}      true if the user has devices
 */
export default function hasUserSettings( state ) {
	return ! isEmpty( state.userDevices.items );
}
