/**
 * External dependencies
 *
 * @format
 */

/**
 * Object contains countries for which alternate processors may require additional fields
 * PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ {countryCode} ].fields - defines form field names we MUST display for extra payment information
 */
export const PAYMENT_PROCESSOR_COUNTRIES_FIELDS = {
	BR: {
		fields: [
			'document',
			'street-number',
			'address-1',
			'address-2',
			'state',
			'city',
			'phone-number',
			'postal-code',
		],
	},
	MX: {
		fields: [ 'phone-number', 'postal-code' ],
	},
	IN: {
		fields: [ 'pan', 'street-number', 'address-1', 'address-2', 'state', 'city', 'postal-code' ],
	},
};
