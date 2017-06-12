/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are requesting the timezones
 *
 * @param {Object} state - Global state tree
 * @return {Boolean} - Whether timezones is being requested
 */
export default function isRequestingTimezones( state ) {
	return get( state, 'timezones.isRequesting', false );
}
