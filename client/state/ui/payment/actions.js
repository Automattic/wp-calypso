/** @format */

/**
 * Internal dependencies
 */
import {
	PAYMENT_COUNTRY_CODE_SET,
	PAYMENT_POSTAL_CODE_SET,
	PAYMENT_TAX_RATE_SET,
	PAYMENT_TAX_RATE_REQUEST,
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
 * Returns an action object used to set the payment postal code (US only).
 *
 * @param {string} postalCode - The 5 digit postal code to set.
 * @return {Object} - The action object.
 */
export function setPaymentPostalCode( postalCode ) {
	return {
		type: PAYMENT_POSTAL_CODE_SET,
		postalCode,
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

/**
 * Returns an action object used to request the local sales tax rate from the server (US only).
 *
 * @return {Object} - The action object.
 */
export function requestPaymentTaxRate() {
	return {
		type: PAYMENT_TAX_RATE_REQUEST,
	};
}
