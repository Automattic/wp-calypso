/**
 * External dependencies
 */
import { get, values } from 'lodash';

/**
 * Returns the current user's devices
 *
 * @param  {Object} state Global state tree
 * @return {Object}       current user's devices
 */
export default function getUserDevices( state ) {
	return values( get( state, 'userDevices.items', null ) );
}
