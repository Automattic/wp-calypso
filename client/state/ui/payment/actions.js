/** @format */

/**
 * Internal dependencies
 */
import { PAYMENT_COUNTRY_CODE_SET } from 'state/action-types';

/**
 * Returns an action object used to set the payment country.
 *
 * @param {string} countryCode - The two-letter country code to set.
 * @return {Object} - The action object.
 */
export function setPaymentCountryCode( countryCode ) {
	return {
		type: PAYMENT_COUNTRY_CODE_SET,
		countryCode,
	};
}
