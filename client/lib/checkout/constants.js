/**
 * External dependencies
 *
 * @format
 */

/**
 * Object contains countries for which Ebanx payment processing is possible
 * PAYMENT_PROCESSOR_EBANX_COUNTRIES[ {countryCode} ].fields - defines form field names we can display for extra payment information
 */
export const PAYMENT_PROCESSOR_EBANX_COUNTRIES = {
	BR: {
		fields: [
			'document',
			'street-number',
			'address-1',
			'address-2',
			'state',
			'city',
			'phone-number',
		],
	},
	MX: {
		fields: [],
	},
};
