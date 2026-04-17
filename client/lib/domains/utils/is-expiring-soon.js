import moment from 'moment';

/**
 * Checks if a domain is expiring within the given number of days from now.
 * Already-expired domains are excluded — they are handled separately from
 * "expiring soon" warnings. Dates are compared in UTC to avoid timezone drift.
 * @param {Object} domain - domain object with `expired` (boolean) and `expiry` (date string) properties
 * @param {number} expiresWithinDays - look-ahead window in days
 * @returns {boolean} - true if the domain is active and its expiry falls within the window
 */
export function isExpiringSoon( domain, expiresWithinDays ) {
	return (
		! domain.expired &&
		moment.utc( domain.expiry ).isBefore( moment.utc().add( expiresWithinDays, 'days' ) )
	);
}
