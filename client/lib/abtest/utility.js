/**
 * Internal dependencies
 */
import activeTests from 'lib/abtest/active-tests';

export const ABTEST_LOCALSTORAGE_KEY = 'ABTests';

/**
 * Returns all active test names
 *
 * @returns {string[]} All active test names with respective timestamp appended to the end
 */
export function getActiveTestNames( { appendDatestamp = false, asCSV = false } = {} ) {
	const output = Object.keys( activeTests ).map( ( key ) =>
		appendDatestamp ? `${ key }_${ activeTests[ key ].datestamp }` : key
	);
	return asCSV ? output.join( ',' ) : output;
}
