/**
 * External dependencies
 */
import moment from 'moment';

export function isExpiringSoon( expiry, expiresWithinDays ) {
	return moment.utc( expiry ).isBefore( moment.utc().add( expiresWithinDays, 'days' ) );
}
