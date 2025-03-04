/**
 * External dependencies
 */
import { toDate } from 'date-fns';

/**
 * Like date-fn's toDate, but tries to guess the format when a string is
 * given.
 * @param input Value to turn into a date.
 */
export function inputToDate( input: Date | string | number ): Date {
	if ( typeof input === 'string' ) {
		return new Date( input );
	}
	return toDate( input );
}

/**
 * Converts a 12-hour time to a 24-hour time.
 * @param hours
 * @param isPm
 */
export function from12hTo24h( hours: number, isPm: boolean ) {
	return isPm ? ( ( hours % 12 ) + 12 ) % 24 : hours % 12;
}

/**
 * Converts a 24-hour time to a 12-hour time.
 * @param hours
 */
export function from24hTo12h( hours: number ) {
	return hours % 12 || 12;
}
