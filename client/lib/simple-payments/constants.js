/** @format */
export const SIMPLE_PAYMENTS_PRODUCT_POST_TYPE = 'jp_pay_product';

export const DEFAULT_CURRENCY = 'USD';

// https://developer.paypal.com/docs/integration/direct/rest/currency-codes/
// If this list changes, Simple Payments in Jetpack must be updated as well.
// See https://github.com/Automattic/jetpack/blob/master/modules/simple-payments/simple-payments.php
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
