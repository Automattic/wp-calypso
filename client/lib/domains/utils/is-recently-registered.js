import moment from 'moment';

/**
 * Compares a domain's registration date to the current timestamp to determine if a domain was
 * registered recently. Defaults to an arbitrary limit of 30 minutes.
 * @param {import('moment').MomentInput} registrationDate
 * @param {number} numberOfMinutes
 * @returns {boolean}
 */
export function isRecentlyRegistered( registrationDate, numberOfMinutes = 30 ) {
	return (
		registrationDate &&
		moment.utc( registrationDate ).isAfter( moment.utc().subtract( numberOfMinutes, 'minutes' ) )
	);
}
