/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_TTL } from './constants';

/***
 * Whether a Jetpack Connect store timestamp is stale.
 * @param   {Number} timestamp  Item to check.
 * @param   {Number} expiration Expiration to compare with, in milliseconds. Default is JETPACK_CONNECT_TTL.
 * @returns {Boolean}           True if the timestamp is stale, false otherwise.
 */
export function isStale( timestamp, expiration = JETPACK_CONNECT_TTL ) {
	const now = new Date().getTime();
	if ( ! timestamp ) {
		return false;
	}
	return ( now - timestamp ) >= expiration;
}
