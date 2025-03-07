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
