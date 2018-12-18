/**
 * External dependencies
 *
 * @format
 */
import i18n from 'i18n-calypso';
import { isUndefined, isEmpty, pick } from 'lodash';
import { CPF } from 'cpf_cnpj';

/**
 * Internal dependencies
 */
import { PAYMENT_PROCESSOR_EBANX_COUNTRIES } from 'lib/checkout/constants';
import { isPaymentMethodEnabled } from 'lib/cart-values';
import CartStore from 'lib/cart/store';

/**
 * Returns whether we should Ebanx credit card processing for a particular country
 * @param {String} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {Boolean} Whether the country code requires ebanx payment processing
 */
export function isEbanxCreditCardProcessingEnabledForCountry( countryCode = '' ) {
	return (
		! isUndefined( PAYMENT_PROCESSOR_EBANX_COUNTRIES[ countryCode ] ) &&
		isPaymentMethodEnabled( CartStore.get(), 'ebanx' )
	);
}

/**
 * Returns whether
 * @param {String} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {Boolean} Whether the country requires additional fields
 */
export function shouldRenderAdditionalEbanxFields( countryCode = '' ) {
	return (
		isEbanxCreditCardProcessingEnabledForCountry( countryCode ) &&
		! isEmpty( PAYMENT_PROCESSOR_EBANX_COUNTRIES[ countryCode ].fields )
	);
}

/**
 * CPF number (Cadastrado de Pessoas Físicas) is the Brazilian tax identification number.
 * Total of 11 digits: 9 numbers followed by 2 verification numbers . E.g., 188.247.019-22
 *
 * @param {String} cpf - a Brazilian tax identification number
 * @returns {Boolean} Whether the cpf is valid or not
 */

export function isValidCPF( cpf = '' ) {
	return CPF.isValid( cpf );
}

/**
 * Returns ebanx validation rule sets for defined fields. Ebanx required fields may vary according to country
 * See: https://developers.ebanx.com/api-reference/full-api-documentation/ebanx-payment-2/ebanx-payment-guide/guide-create-a-payment/
 * @param {string} country two-letter country code to determine the required ebanx fields
 * @returns {object} the ruleset
 */
export function ebanxFieldRules( country ) {
	const ebanxFields = PAYMENT_PROCESSOR_EBANX_COUNTRIES[ country ].fields || [];

	return pick(
		{
			document: {
				description: i18n.translate( 'Taxpayer Identification Number' ),
				rules: [ 'validCPF' ],
			},

			'street-number': {
				description: i18n.translate( 'Street Number' ),
				rules: [ 'required', 'validStreetNumber' ],
			},

			'address-1': {
				description: i18n.translate( 'Address' ),
				rules: [ 'required' ],
			},

			state: {
				description: i18n.translate( 'State' ),
				rules: [ 'required' ],
			},

			city: {
				description: i18n.translate( 'City' ),
				rules: [ 'required' ],
			},
			'phone-number': {
				description: i18n.translate( 'Phone Number' ),
				rules: [ 'required', 'validPhone' ],
			},

			'postal-code': {
				description: i18n.translate( 'Postal Code' ),
				rules: [ 'required' ],
			},
		},
		ebanxFields
	);
}

export function translatedEbanxError( error ) {
	let errorMessage = i18n.translate(
		'Your payment was not processed this time due to an error, please try to submit it again.'
	);

	switch ( error.status_code ) {
		case 'BP-DR-55':
			errorMessage = { message: { cvv: i18n.translate( 'Invalid credit card CVV number' ) } };
			break;
		case 'BP-DR-51':
		case 'BP-DR-95':
			errorMessage = { message: { name: i18n.translate( 'Please enter your name.' ) } };
			break;
	}

	return errorMessage;
}
