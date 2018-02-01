/** @format */

/**
 * Internal dependencies
 */
import activeTests from 'lib/abtest/active-tests';

export const ABTEST_LOCALSTORAGE_KEY = 'ABTests';

/**
 * Returns all active test names
 * @returns {String[]} All active test names with respective timestamp appended to the end
 */
export function getActiveTestNames( { asCSV = true } = {} ) {
	const output = Object.keys( activeTests ).map(
		key => `${ key }_${ activeTests[ key ].datestamp }`
	);
	return asCSV ? output.join( ',' ) : output;
}
