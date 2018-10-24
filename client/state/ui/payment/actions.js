/** @format */

/**
 * Internal dependencies
 */
import {
	PAYMENT_COUNTRY_CODE_SET,
	PAYMENT_POSTCODE_SET,
	PAYMENT_TAX_RATE_SET,
} from 'state/action-types';

import 'state/data-layer/wpcom/tax';

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

/**
 * Returns an action object used to set the payment postcode (US only).
 *
 * @param {string} postcode - The 5 digit postcode to set.
 * @return {Object} - The action object.
 */
export function setPaymentPostcode( postcode ) {
	return {
		type: PAYMENT_POSTCODE_SET,
		postcode,
	};
}

/**
 * Returns an action object used to set the local sales tax rate (US only).
 *
 * @param {float} taxRate - the tax rate to set.
 * @return {Object} - The action object.
 */
export function setPaymentTaxRate( taxRate ) {
	return {
		type: PAYMENT_TAX_RATE_SET,
		taxRate,
	};
}
