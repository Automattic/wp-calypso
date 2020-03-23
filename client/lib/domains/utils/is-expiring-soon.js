/**
 * External dependencies
 */
import moment from 'moment';

export function isExpiringSoon( domain, expiresWithinDays ) {
	return (
		! domain.expired &&
		moment.utc( domain.expiry ).isBefore( moment.utc().add( expiresWithinDays, 'days' ) )
	);
}
