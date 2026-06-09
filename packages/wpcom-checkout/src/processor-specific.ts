import { isValid as isValidCnpj } from '@fnando/cnpj';
import { isValid as isValidCpf } from '@fnando/cpf';
import i18n from 'i18n-calypso';
import { PAYMENT_PROCESSOR_COUNTRIES_FIELDS } from './payment-processor-countries-fields';

/**
 * CPF number (Cadastrado de Pessoas Físicas) is the Brazilian tax identification number.
 * Total of 11 digits: 9 numbers followed by 2 verification numbers . E.g., 188.247.019-22
 * @param {string} cpf - a Brazilian tax identification number
 * @returns {boolean} Whether the cpf is valid or not
 */
export function isValidCPF( cpf: string ): boolean {
	return isValidCpf( cpf );
}

/**
 * CNPJ number (Cadastro Nacional da Pessoa Jurídica ) is the Brazilian tax identification number for companies.
 * Total of 14 digits: 8 digits identify the company, a slash, 4 digit to identify the branch, followed by 2 verification numbers . E.g., 67.762.675/0001-49
 * @param {string} cnpj - a Brazilian company tax identification number
 * @returns {boolean} Whether the cnpj is valid or not
 */
export function isValidCNPJ( cnpj: string ): boolean {
	return isValidCnpj( cnpj );
}

/**
 * Validates a Brazilian taxpayer identification number, accepting either a CPF
 * (individual, 11 digits) or a CNPJ (company, 14 digits). Ebanx accepts both
 * forms in the same `document` field, so callers can use this rather than
 * branching on which form the user entered.
 * @param {string} taxId - a Brazilian taxpayer identification number (CPF or CNPJ)
 * @returns {boolean} Whether the value is a valid CPF or CNPJ
 */
export function isValidBrazilianTaxId( taxId: string ): boolean {
	return isValidCPF( taxId ) || isValidCNPJ( taxId );
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

export interface FieldRule {
	description: string;
	rules: string[];
}
export type FieldRuleCollection = Record< string, FieldRule >;

/**
 * Returns country/processor specific validation rule sets for defined fields.
 * @param {string} country two-letter country code to determine the required fields
 */
export function countrySpecificFieldRules( country: string ): FieldRuleCollection {
	const countryFields = PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ country ]?.fields ?? [];

	const allFields: FieldRuleCollection = Object.assign(
		{
			document: {
				description: i18n.translate( 'Taxpayer Identification Number', { textOnly: true } ),
				rules: [ 'validBrazilTaxId' ],
			},

			'phone-number': {
				description: i18n.translate( 'Phone Number', { textOnly: true } ),
				rules: [ 'required' ],
			},
			name: {
				description: i18n.translate( 'Your Name', { textOnly: true } ),
				rules: [ 'required' ],
			},
			'postal-code': {
				description: i18n.translate( 'Postal Code', { textOnly: true } ),
				rules: [ 'required' ],
			},
		},
		fullAddressFieldsRules()
	);

	return Object.keys( allFields ).reduce( ( filteredFields, fieldName ) => {
		if ( countryFields.includes( fieldName ) ) {
			filteredFields[ fieldName ] = allFields[ fieldName ];
		}
		return filteredFields;
	}, {} as FieldRuleCollection );
}

export function translatedEbanxError( error: { status_code: string; message?: string } ) {
	// It's unclear if this property still exists
	switch ( error.status_code ) {
		case 'BP-DR-55':
			return i18n.translate( 'Invalid credit card CVV number' );
		case 'BP-DR-51':
		case 'BP-DR-95':
			return i18n.translate( 'Please enter your name.' );
	}

	if ( error.message ) {
		return error.message;
	}

	return i18n.translate(
		'Your payment was not processed this time due to an error, please try to submit it again.'
	);
}
