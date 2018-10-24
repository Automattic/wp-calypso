/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

export function dummyTaxRate( postalCode, countryCode ) {
	if ( countryCode !== 'US' ) {
		return null;
	}

	return Number( String( postalCode ).slice( -3 ) ) / 1000;
}
