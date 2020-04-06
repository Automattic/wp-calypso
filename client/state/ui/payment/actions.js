/**
 * Internal dependencies
 */
import { PAYMENT_COUNTRY_CODE_SET, PAYMENT_POSTAL_CODE_SET } from 'state/action-types';

/**
 * Returns an action object used to set the payment country.
 *
 * @param {string} countryCode - The two-letter country code to set.
 * @returns {object} - The action object.
 */
export function setPaymentCountryCode( countryCode ) {
	return {
		type: PAYMENT_COUNTRY_CODE_SET,
		countryCode,
	};
}

/**
 * Returns an action object used to set the payment postal code (US only).
 *
 * @param {string} postalCode - The 5 digit postal code to set.
 * @returns {object} - The action object.
 */
export function setPaymentPostalCode( postalCode ) {
	return {
		type: PAYMENT_POSTAL_CODE_SET,
		postalCode,
	};
}
