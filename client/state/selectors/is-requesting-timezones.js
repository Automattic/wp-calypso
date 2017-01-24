/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns `true` if the client is making a timezones request.
 *
 * @param  {Object} state - Global state tree
 * @return {Boolean} whether a timezones request is being done
 */
export default function isRequestingTimezones( state ) {
	return get( state, 'timezones.requesting', false );
}
