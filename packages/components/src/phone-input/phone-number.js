/**
 * External dependencies
 */
import { find, flatten, includes, map, startsWith } from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import debugFactory from 'debug';
import { countries, dialCodeMap } from './data';

/**
 * Internal Dependencies
 */

const debug = debugFactory( 'phone-input:metadata' );

export const DIGIT_PLACEHOLDER = '\u7003';
const STANDALONE_DIGIT_PATTERN = /\d(?=[^,}][^,}])/g;
const CHARACTER_CLASS_PATTERN = /\[([^[\]])*]/g;
const LONGEST_NUMBER = '999999999999999';
const LONGEST_NUMBER_MATCH = /9/g;
export const MIN_LENGTH_TO_FORMAT = 3;

/**
 * Removes non digit characters from the string
 *
 * @param {string} inputNumber - Text to remove non-digits from
 * @returns {string} - Text with non-digits removed
 */
export const stripNonDigits = inputNumber => inputNumber.replace( /\D/g, '' );

function prefixSearch( prefixQuery ) {
	return flatten(
		Object.keys( dialCodeMap )
			.filter( dialCode => startsWith( prefixQuery, dialCode ) )
			.map( dialCode => dialCodeMap[ dialCode ] )
	);
}

export function findCountryFromNumber( inputNumber ) {
	let lastExactMatch;

	for ( let i = 1; i <= 6; i++ ) {
		const query = stripNonDigits( inputNumber )
			.replace( /^0+/, '' )
			.substr( 0, i );
		if ( Object.prototype.hasOwnProperty.call( dialCodeMap, query ) ) {
			const exactMatch = dialCodeMap[ query ];
			if ( exactMatch.length === 1 ) {
				return countries[ exactMatch[ 0 ] ];
			}
			if ( exactMatch.length > 1 ) {
				lastExactMatch = exactMatch;
			}
		}

		const prefixMatch = prefixSearch( query );

		if ( ! prefixMatch.length && lastExactMatch ) {
			// the one with high priority
			return map( lastExactMatch, key => countries[ key ] )[ 0 ];
		}

		if ( prefixMatch.length === 1 ) {
			// not an exact match, but there is only one option with this prefix
			return countries[ prefixMatch[ 0 ] ];
		}
	}

	if ( lastExactMatch ) {
		return map( lastExactMatch, key => countries[ key ] )[ 0 ];
	}

	return null;
}

export const findPattern = ( inputNumber, patterns ) =>
	find( patterns, ( { match, leadingDigitPattern } ) => {
		if ( leadingDigitPattern && inputNumber.search( leadingDigitPattern ) !== 0 ) {
			return false;
		}
		return new RegExp( '^(?:' + match + ')$' ).test( inputNumber );
	} );

/**
 * Creates a template that is long enough to capture the length of phoneNumber
 * e.g. makeTemplate( '4259999999', countryData.us.patterns ) === '(...) ...-....' (where . is actually
 * DIGIT_PLACEHOLDER)
 *
 * @param {string} phoneNumber - The phone number
 * @param {Array} patterns - The list of patterns
 * @returns {string} The template string
 */
export function makeTemplate( phoneNumber, patterns ) {
	const selectedPattern = find( patterns, pattern => {
		if ( includes( pattern.format, '|' ) ) {
			return false;
		}
		if ( pattern.leadingDigitPattern && phoneNumber.search( pattern.leadingDigitPattern ) !== 0 ) {
			return false;
		}
		debug( 'pattern.match = ', pattern );
		const match = pattern.match
			.replace( CHARACTER_CLASS_PATTERN, '\\d' )
			.replace( STANDALONE_DIGIT_PATTERN, '\\d' );
		const matchingNumber = LONGEST_NUMBER.match( new RegExp( match ) )[ 0 ];

		return matchingNumber.length >= phoneNumber.length;
	} );

	if ( ! selectedPattern ) {
		return phoneNumber.replace( /./g, DIGIT_PLACEHOLDER );
	}

	const selectedPatternMatch = selectedPattern.match
		.replace( CHARACTER_CLASS_PATTERN, '\\d' )
		.replace( STANDALONE_DIGIT_PATTERN, '\\d' );

	const matchingNumber = LONGEST_NUMBER.match( new RegExp( selectedPatternMatch ) )[ 0 ];
	const template = matchingNumber.replace(
		new RegExp( selectedPatternMatch, 'g' ),
		selectedPattern.replace
	);
	return template.replace( LONGEST_NUMBER_MATCH, DIGIT_PLACEHOLDER );
}

/**
 * Applies a template to a phone number with the option for cursor position tracking
 *
 * @param {string} phoneNumber - The phone number in national number format
 * @param {string} template - The template string generated by `makeTemplate`
 * @param {{pos: number}} [positionTracking={pos:0}] - Optional object with 'pos' property matching to the cursor
 *   position. The function will update the pos property to the match the new position after applying the template.
 * @returns {string} The formatted number
 */
export function applyTemplate( phoneNumber, template, positionTracking = { pos: 0 } ) {
	let res = '',
		phoneNumberIndex = 0;

	const originalPosition = positionTracking.pos;
	for ( let i = 0; i < template.length && phoneNumberIndex < phoneNumber.length; i++ ) {
		const char = template[ i ];
		if ( char === DIGIT_PLACEHOLDER ) {
			res += phoneNumber[ phoneNumberIndex++ ];
		} else {
			res += template[ i ];
			if ( phoneNumberIndex <= originalPosition ) {
				positionTracking.pos++;
			}
		}
	}
	return res;
}

/**
 * Processes a non-formatted input and generates a dial prefix and national phone number. This method does not format
 * the string.
 * This is an opinionated function, it assumes that
 * If the number starts with a "+", it will use an international format.
 * If the number starts with a "1" and is a NANPA number, it will use the national format with "1 " as prefix
 * If the number starts does not start with a "1" but is a NANPA number, it will just use the national format with no
 * prefix. For everything else it will use the `nationalPrefix` for the given region.
 *
 * @param {string} inputNumber - Unformatted number
 * @param {object} numberRegion - The local/region for which we process the number
 * @returns {{nationalNumber: string, prefix: string}} - Phone is the national phone number and prefix is to be
 *   shown before the phone number
 */
export function processNumber( inputNumber, numberRegion ) {
	let prefix = numberRegion.nationalPrefix || '';
	let nationalNumber = stripNonDigits( inputNumber ).replace(
		new RegExp( '^(0*' + numberRegion.dialCode + ')?(' + numberRegion.nationalPrefix + ')?' ),
		''
	);

	if ( numberRegion.nationalPrefix === '0' ) {
		nationalNumber = nationalNumber.replace( /^0+/, '' );
	}

	debug( `National Number: ${ nationalNumber } for ${ inputNumber } in ${ numberRegion.isoCode }` );

	if ( inputNumber[ 0 ] === '+' ) {
		prefix = '+' + numberRegion.dialCode + ' ';
	} else if ( numberRegion.dialCode === '1' ) {
		prefix = stripNonDigits( inputNumber )[ 0 ] === '1' ? '1 ' : '';
	}

	return { nationalNumber, prefix };
}

/**
 * Formats a phone number within the given region.
 * Formatting numbers is a beast. In order to reduce the amount of the complexity this can bring, this function makes a
 * few assumptions.
 *
 * If the number starts with a "+", the international formats are preferred. Not all of the countries have different
 * international and nationals formats. So you might not see a difference apart from having an international prefix or a
 * national one.
 *
 * For example NANPA countries have international formats `+1 555-666-7777 which are different than
 * national ones: `(555) 666-7777`. NANPA countries can also have a special format where the number starts with `1`, in
 * which case the format will be `1 (555) 666-7777).
 *
 * For the most part of the world except NANPA, the national dial prefix is 0. So you might see `0555 666 7777` as a
 * national format and `+90 5556667777` as international format.
 *
 * This function also supports partial formatting, i.e. it can format incomplete numbers as well.
 *
 * @param {string} inputNumber - Unformatted number
 * @param {object} country - The region for which we are formatting
 * @returns {string} - Formatted number
 */
export function formatNumber( inputNumber, country ) {
	const digitCount = stripNonDigits( inputNumber ).length;
	if ( digitCount < MIN_LENGTH_TO_FORMAT || digitCount < ( country.dialCode || '' ).length ) {
		if ( inputNumber[ 0 ] === '+' ) {
			return '+' + stripNonDigits( inputNumber.substr( 1 ) );
		}
		return stripNonDigits( inputNumber );
	}

	// Some countries don't have their own patterns, but share / follow another country's patterns. Here we switch the
	// country to the one with the patterns.
	if ( country.patternRegion ) {
		country = countries[ country.patternRegion ];
	}

	const { nationalNumber, prefix } = processNumber( inputNumber, country );

	const patterns =
		( includes( [ '+', '1' ], inputNumber[ 0 ] ) && country.internationalPatterns ) ||
		country.patterns ||
		[];
	const pattern = findPattern( nationalNumber, patterns );

	if ( pattern ) {
		debug(
			`Will replace "${ nationalNumber }" with "${ pattern.match }" and "${ pattern.replace }" with prefix "${ prefix }"`
		);
		return prefix + nationalNumber.replace( new RegExp( pattern.match ), pattern.replace );
	}

	debug( `Couldn't find a ${ country.isoCode } pattern for ${ inputNumber }` );

	const template = makeTemplate( nationalNumber, patterns );
	if ( template ) {
		debug( `Will replace "${ nationalNumber }" with "${ template }" with prefix "${ prefix }"` );
		return prefix + applyTemplate( nationalNumber, template );
	}
	return inputNumber;
}

export function toE164( inputNumber, country ) {
	const { nationalNumber } = processNumber( inputNumber, country );
	return '+' + country.dialCode + nationalNumber;
}

export function toIcannFormat( inputNumber, country ) {
	if ( ! country ) {
		return inputNumber;
	}

	const { nationalNumber } = processNumber( inputNumber, country ),
		countryCode = country.countryDialCode || country.dialCode,
		dialCode = country.countryDialCode && country.regionCode ? country.regionCode : '';

	return '+' + countryCode + '.' + dialCode + nationalNumber;
}
