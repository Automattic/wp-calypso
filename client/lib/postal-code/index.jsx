/**
 * External dependencies
 */
import { get, includes, replace } from 'lodash';

function defaultFormatter( postalCode, delimiter, partLength ) {
	return postalCode.substring( 0, partLength ) + delimiter + postalCode.substring( partLength );
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
			delimiter: '-',
			partLength: 5,
		},
		CA: {
			length: [ 6 ],
			delimiter: ' ',
			partLength: 3,
		},
		GB: {
			length: [ 5, 6, 7 ],
			delimiter: ' ',
			formatter: ( postalCodeInput, delimiter ) => {
				return (
					postalCodeInput.substring( 0, postalCodeInput.length - 3 ) +
					delimiter +
					postalCodeInput.substring( postalCodeInput.length - 3 )
				);
			},
		},
		IE: {
			length: [ 7 ],
			delimiter: ' ',
			partLength: 3,
		},
		JP: {
			length: [ 7 ],
			delimiter: '-',
			partLength: 3,
		},
		KY: {
			length: [ 7 ],
			delimiter: '-',
			partLength: 3,
		},
		NL: {
			length: [ 6 ],
			delimiter: ' ',
			partLength: 4,
		},
		PL: {
			length: [ 5 ],
			delimiter: '-',
			partLength: 2,
		},
		PT: {
			length: [ 7 ],
			delimiter: '-',
			partLength: 4,
		},
		SE: {
			length: [ 5 ],
			delimiter: ' ',
			partLength: 3,
		},
	};

	const countryCodeData = get( twoPartPostalCodes, countryCode, false );
	if ( ! countryCodeData ) {
		return postalCode;
	}

	const postalCodeWithoutDelimeters = replace( postalCode, /[\s-]/g, '' );

	if ( includes( countryCodeData.length, postalCodeWithoutDelimeters.length ) ) {
		if ( countryCodeData.formatter ) {
			return countryCodeData.formatter( postalCodeWithoutDelimeters, countryCodeData.delimiter );
		}

		return defaultFormatter(
			postalCodeWithoutDelimeters,
			countryCodeData.delimiter,
			countryCodeData.partLength
		);
	}

	return postalCode;
}

export const postalCodePatterns = {
	US: /^\d{5}$/,
};

export function isValidPostalCode( postalCode, countryCode = 'US' ) {
	// TODO - every other country
	if ( ! postalCode ) {
		return false;
	}

	const pattern = postalCodePatterns[ countryCode ];
	if ( ! pattern ) {
		return true;
	}

	return pattern.test( postalCode );
}
