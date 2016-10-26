/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_TTL } from './constants';

/***
 * Whether a Jetpack Connect store timestamp is stale.
 * @param   {Number} timestamp  Item to check.
 * @returns {Boolean}           True if the timestamp is stale, false otherwise.
 */
export function isStale( timestamp ) {
	const now = new Date().getTime();
	if ( ! timestamp ) {
		return false;
	}
	return ( now - timestamp ) >= JETPACK_CONNECT_TTL;
}
