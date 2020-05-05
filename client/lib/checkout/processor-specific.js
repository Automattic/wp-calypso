/**
 * External dependencies
 *
 */
import i18n from 'i18n-calypso';
import { isUndefined, isEmpty, pick } from 'lodash';
import { CPF, CNPJ } from 'cpf_cnpj';

/**
 * Internal dependencies
 */
import { PAYMENT_PROCESSOR_COUNTRIES_FIELDS } from 'lib/checkout/constants';
import { isPaymentMethodEnabled } from 'lib/cart-values';
import CartStore from 'lib/cart/store';

/**
 * Returns whether we should Ebanx credit card processing for a particular country
 *
 * @param {string} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {boolean} Whether the country code requires ebanx payment processing
 */
export function isEbanxCreditCardProcessingEnabledForCountry( countryCode = '' ) {
	return (
		! isUndefined( PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ countryCode ] ) &&
		isPaymentMethodEnabled( CartStore.get(), 'ebanx' )
	);
}

/**
 * Returns whether
 *
 * @param {string} countryCode - a two-letter country code, e.g., 'DE', 'BR'
 * @returns {boolean} Whether the country requires additional fields
 */
export function shouldRenderAdditionalCountryFields( countryCode = '' ) {
	return (
		isEbanxCreditCardProcessingEnabledForCountry( countryCode ) &&
		! isEmpty( PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ countryCode ].fields )
	);
}

/**
 * CPF number (Cadastrado de Pessoas Físicas) is the Brazilian tax identification number.
 * Total of 11 digits: 9 numbers followed by 2 verification numbers . E.g., 188.247.019-22
 *
 * @param {string} cpf - a Brazilian tax identification number
 * @returns {boolean} Whether the cpf is valid or not
 */
export function isValidCPF( cpf = '' ) {
	return CPF.isValid( cpf );
}

/**
 * CNPJ number (Cadastro Nacional da Pessoa Jurídica ) is the Brazilian tax identification number for companies.
 * Total of 14 digits: 8 digits identify the company, a slash, 4 digit to identify the branch, followed by 2 verification numbers . E.g., 67.762.675/0001-49
 *
 * @param {string} cnpj - a Brazilian company tax identification number
 * @returns {boolean} Whether the cnpj is valid or not
 */
export function isValidCNPJ( cnpj = '' ) {
	return CNPJ.isValid( cnpj );
}

export function fullAddressFieldsRules() {
	return {
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

		'postal-code': {
			description: i18n.translate( 'Postal Code' ),
			rules: [ 'required' ],
		},
	};
}

/**
 * Returns country/processor specific validation rule sets for defined fields.
 *
 * @param {string} country two-letter country code to determine the required fields
 * @returns {object} the ruleset
 */
export function countrySpecificFieldRules( country ) {
	const countryFields = PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ country ].fields || [];

	return pick(
		Object.assign(
			{
				document: {
					description: i18n.translate( 'Taxpayer Identification Number' ),
					rules: [ 'validBrazilTaxId' ],
				},

				'phone-number': {
					description: i18n.translate( 'Phone Number' ),
					rules: [ 'required' ],
				},
				name: {
					description: i18n.translate( 'Your Name' ),
					rules: [ 'required' ],
				},
				nik: {
					description: i18n.translate( 'NIK - Indonesia Identity Card Number', {
						comment:
							'NIK - Indonesia Identity Card Number required for Indonesian payment methods.',
					} ),
					rules: [ 'validIndonesiaNik' ],
				},

				pan: {
					description: i18n.translate( 'PAN - Permanent account number' ),
					rules: [ 'validIndiaPan' ],
				},
				gstin: {
					description: i18n.translate( 'GSTIN - GST identification number', {
						comment: 'GSTIN: India specific tax id number',
					} ),
					rules: [ 'validIndiaGstin' ],
				},
				'postal-code': {
					description: i18n.translate( 'Postal Code' ),
					rules: [ 'required' ],
				},
			},
			fullAddressFieldsRules()
		),
		countryFields
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
