/**
 * External dependencies
 *
 * @format
 */
import { isUndefined, isEmpty } from 'lodash';
import i18n from 'i18n-calypso';
import { CPF } from 'cpf_cnpj';

/**
 * Internal dependencies
 */
import { PAYMENT_PROCESSOR_EBANX_COUNTRIES } from './constants';
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
 *
 * @param {String} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {Boolean} Whether the country requires additional fields
 */
export function shouldRenderAdditionalEbanxFields( countryCode = '' ) {
	return (
		! isUndefined( PAYMENT_PROCESSOR_EBANX_COUNTRIES[ countryCode ] ) &&
		! isEmpty( PAYMENT_PROCESSOR_EBANX_COUNTRIES[ countryCode ].requiredFields )
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
