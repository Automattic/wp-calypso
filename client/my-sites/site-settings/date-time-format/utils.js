/**
 * External dependencies
 */

import moment from 'moment-timezone';
import { has, startsWith } from 'lodash';

/**
 * Adjust the current date and time to the site settings timezone.
 * The timezone can be formatted either as an UTC offset ("UTC+0"),
 * or as a timezone identifier ("Europe/London").
 * In the first case, the date-time must be adjusted by the UTC offset converted in minutes;
 * in the latter, it's enough to use the tz() method provided by Moment.js.
 *
 * @see http://momentjs.com/docs/#/manipulating/utc-offset/
 * @see http://momentjs.com/timezone/docs/#/using-timezones/parsing-in-zone/
 *
 * @param {string} timezoneString A timezone string.
 * @returns {object} The timezone-adjusted Moment.js object of the current date and time.
 */
export function getLocalizedDate( timezoneString ) {
	return startsWith( timezoneString, 'UTC' )
		? moment().utcOffset( timezoneString.substring( 3 ) * 60 ) // E.g. "UTC+5" -> "+5" * 60 -> 300
		: moment.tz( timezoneString );
}

/**
 * Mapping object between PHP date() and Moment.js format() tokens.
 * The commented tokens exist in PHP but have no direct Moment.js equivalent.
 *
 * The "S" case is an exception, since it's only used in conjunction with "j":
 * PHP `date( 'jS' )` returns "1st", which is equivalent to `moment().format( 'Do' )`)
 *
 * @see http://php.net/manual/en/function.date.php#refsect1-function.date-parameters
 * @see http://momentjs.com/docs/#/displaying/format/
 *
 * @type {object}
 */
const phpToMomentMapping = {
	d: 'DD',
	D: 'ddd',
	j: 'D',
	l: 'dddd',
	N: 'E',
	// "S" is andled via custom check
	//S: '',
	w: 'd',
	// Moment.js equivalent of "z" (0 based) is "DDD" (1 based), so it must be adjusted
	//z: 'DDD',
	W: 'W',
	F: 'MMMM',
	m: 'MM',
	M: 'MMM',
	n: 'M',
	// Moment.js has no "t" token equivalent, but a `moment().daysInMonth()` function
	//t: '',
	// Moment.js has no "L" token equivalent, but a `moment().isLeapYear()` function
	//L: '',
	o: 'Y',
	Y: 'YYYY',
	y: 'YY',
	a: 'a',
	A: 'A',
	// Moment.js has no "B" token equivalent, but can be generated nonetheless
	//B: '',
	g: 'h',
	G: 'H',
	h: 'hh',
	H: 'HH',
	i: 'mm',
	s: 'ss',
	u: 'SSSSSS',
	v: 'SSS',
	e: 'z',
	// Moment.js has no "I" token, but a `moment().isDST()` function
	//I: '',
	O: 'ZZ',
	P: 'Z',
	// Moment.js has no "T" token equivalent, but is similar enough to "z"
	T: 'z',
	// Moment.js has no "Z" token equivalent, but can be generated nonetheless
	//Z: '',
	c: 'YYYY-MM-DDTHH:mm-ssZ',
	r: 'ddd, DD MMM YYYY HH:mm:ss ZZ',
	U: 'X',
};

/**
 * Convert a PHP datetime format string into a Moment.js one.
 *
 * @param {object} momentDate A Moment.js object of the current date and time.
 * @param {string} formatString A PHP datetime format string
 * @returns {string} A Moment.js datetime format string
 */
export function phpToMomentDatetimeFormat( momentDate, formatString ) {
	const mappedFormat = formatString
		.split( '' )
		.map( ( c, i, a ) => {
			const prev = a[ i - 1 ];
			const next = a[ i + 1 ];

			// Check if character is escaped
			if ( '\\' === prev ) {
				return `[${ c }]`;
			}
			if ( '\\' === c ) {
				return '';
			}

			// Check if character is "jS", currently the only double-character token
			if ( 'j' === c && 'S' === next ) {
				return 'Do';
			}
			if ( 'S' === c && 'j' === prev ) {
				return '';
			}

			// Check if character is a token mapped as a function
			switch ( c ) {
				case 'z':
					// "DDD" is 1 based but "z" is 0 based
					return `[${ momentDate.format( 'DDD' ) - 1}]`;
				case 't':
					return `[${ momentDate.daysInMonth() }]`;
				case 'L':
					// 1 or 0
					return `[${ momentDate.isLeapYear() | 0}]`;
				case 'B':
					const utcDate = momentDate.clone().utc();
					const swatchTime =
						( ( utcDate.hours() + 1 ) % 24 ) + utcDate.minutes() / 60 + utcDate.seconds() / 3600;
					return Math.floor( ( swatchTime * 1000 ) / 24 );
				case 'I':
					// 1 or 0
					return `[${ momentDate.isDST() | 0}]`;
				case 'Z':
					// Timezone offset in seconds
					// E.g. "+0100" -> "3600"
					return parseInt( momentDate.format( 'ZZ' ), 10 ) * 36;
			}

			// Check if character is a recognized mapping token
			if ( has( phpToMomentMapping, c ) ) {
				return phpToMomentMapping[ c ];
			}

			// Otherwise, return the character as-is, escaped for Moment.js
			return `[${ c }]`;
		} )
		.join( '' );

	return momentDate.format( mappedFormat );
}
