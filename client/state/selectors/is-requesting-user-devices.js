/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are requesting the current user's devices
 *
 * @param  {Object} state Global state tree
 * @return {Boolean}      Whether the user's devices are being requested
 */
export default function isRequestingTimezones( state ) {
	return get( state, 'devices.isRequesting', false );
}
