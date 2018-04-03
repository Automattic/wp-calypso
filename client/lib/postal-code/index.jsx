/** @format */

/**
 * External dependencies
 */
import { get, includes } from 'lodash';

function defaultFormatter( postalCode, delimeter, partLength ) {
	return postalCode.substring( 0, partLength ) + delimeter + postalCode.substring( partLength );
}

/**
 * Tries to convert given postal code based on the country code into a standardised format
 *
 * @param {string} postalCode user inputted postal code
 * @param {string} countryCode user selected country
 * @returns {string} formatted postal code
 */
export function tryToGuessPostalCodeFormat( postalCode, countryCode ) {
	if ( ! countryCode ) {
		return postalCode;
	}

	const twoPartPostalCodes = {
		BR: {
			length: [ 8 ],
			delimeter: '-',
			partLength: 5,
		},
		CA: {
			length: [ 6 ],
			delimeter: ' ',
			partLength: 3,
		},
		GB: {
			length: [ 5, 6, 7 ],
			delimeter: ' ',
			formatter: ( postalCodeInput, delimeter ) => {
				return (
					postalCodeInput.substring( 0, postalCodeInput.length - 3 ) +
					delimeter +
					postalCodeInput.substring( postalCodeInput.length - 3 )
				);
			},
		},
		IE: {
			length: [ 7 ],
			delimeter: ' ',
			partLength: 3,
		},
		JP: {
			length: [ 7 ],
			delimeter: '-',
			partLength: 3,
		},
		KY: {
			length: [ 7 ],
			delimeter: '-',
			partLength: 3,
		},
		NL: {
			length: [ 6 ],
			delimeter: ' ',
			partLength: 4,
		},
		PL: {
			length: [ 5 ],
			delimeter: '-',
			partLength: 2,
		},
		PT: {
			length: [ 7 ],
			delimeter: '-',
			partLength: 4,
		},
		SE: {
			length: [ 5 ],
			delimeter: ' ',
			partLength: 3,
		},
	};

	const countryCodeData = get( twoPartPostalCodes, countryCode, false );
	if ( ! countryCodeData ) {
		return postalCode;
	}

	if (
		includes( countryCodeData.length, postalCode.length ) &&
		postalCode.indexOf( countryCodeData.delimeter ) === -1
	) {
		let formatter = defaultFormatter;
		if ( countryCodeData.formatter ) {
			formatter = countryCodeData.formatter;
		}

		return formatter( postalCode, countryCodeData.delimeter, countryCodeData.partLength );
	}

	return postalCode;
}
