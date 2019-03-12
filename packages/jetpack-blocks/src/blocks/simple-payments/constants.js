export const SIMPLE_PAYMENTS_PRODUCT_POST_TYPE = 'jp_pay_product';

export const DEFAULT_CURRENCY = 'USD';

// https://developer.paypal.com/docs/integration/direct/rest/currency-codes/
// If this list changes, Simple Payments in Jetpack must be updated as well.
// See https://github.com/Automattic/jetpack/blob/master/modules/simple-payments/simple-payments.php

/**
 * Indian Rupee not supported because at the time of the creation of this file
 * because it's limited to in-country PayPal India accounts only.
 * Discussion: https://github.com/Automattic/wp-calypso/pull/28236
 */
export const SUPPORTED_CURRENCY_LIST = [
	DEFAULT_CURRENCY,
	'EUR',
	'AUD',
	'BRL',
	'CAD',
	'CZK',
	'DKK',
	'HKD',
	'HUF',
	'ILS',
	'JPY',
	'MYR',
	'MXN',
	'TWD',
	'NZD',
	'NOK',
	'PHP',
	'PLN',
	'GBP',
	'RUB',
	'SGD',
	'SEK',
	'CHF',
	'THB',
];
