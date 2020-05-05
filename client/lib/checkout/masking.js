/**
 * External dependencies
 */
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { getCreditCardType } from 'lib/checkout';

/**
 * Formats a credit card card number
 *
 * @param {string} cardNumber unformatted field value
 * @returns {string} formatted value
 */
export function formatCreditCard( cardNumber ) {
	if ( getCreditCardType( cardNumber ) === 'amex' ) {
		return formatAmexCreditCard( cardNumber );
	}
	const digits = cardNumber.replace( /[^0-9]/g, '' ).slice( 0, 19 );
	const formattedNumber = `${ digits.slice( 0, 4 ) } ${ digits.slice( 4, 8 ) } ${ digits.slice(
		8,
		12
	) } ${ digits.slice( 12 ) }`;
	return formattedNumber.trim();
}

/**
 * Formats an American Express card number
 *
 * @param {string} cardNumber unformatted field value
 * @returns {string} formatted value
 */
export function formatAmexCreditCard( cardNumber ) {
	const digits = cardNumber.replace( /[^0-9]/g, '' ).slice( 0, 15 );
	const formattedNumber = `${ digits.slice( 0, 4 ) } ${ digits.slice( 4, 10 ) } ${ digits.slice(
		10,
		15
	) }`;
	return formattedNumber.trim();
}

const fieldMasks = {};

fieldMasks[ 'expiration-date' ] = {
	mask: function ( previousValue, nextValue ) {
		// If the user is deleting from the value then don't modify it
		if ( previousValue && previousValue.length > nextValue.length ) {
			return nextValue;
		}

		// If the user is adding a slash then don't modify it
		if (
			previousValue &&
			previousValue.length === 2 &&
			nextValue.length === 3 &&
			nextValue[ 2 ] === '/'
		) {
			return nextValue;
		}

		// Remove anything except digits and slashes
		nextValue = nextValue.replace( /[^\d]/g, '' );

		if ( nextValue.length <= 2 ) {
			return nextValue;
		}

		return nextValue.substring( 0, 2 ) + '/' + nextValue.substring( 2, 4 );
	},

	unmask: identity,
};

fieldMasks.number = {
	mask: function ( previousValue, nextValue ) {
		return formatCreditCard( nextValue );
	},

	unmask: function ( value ) {
		return value.replace( / /g, '' );
	},
};

fieldMasks.cvv = {
	mask: function ( previousValue, nextValue ) {
		return nextValue.replace( /[^\d]/g, '' ).substring( 0, 4 );
	},

	unmask: identity,
};

// `document` is an EBANX field. Currently used for Brazilian CPF numbers
// See isValidCPF()/isValidCNPJ() / ebanx.js
fieldMasks.document = {
	mask: function ( previousValue, nextValue ) {
		let string = nextValue;

		const digits = nextValue.replace( /[^0-9]/g, '' );

		if ( digits.length > 11 ) {
			// CNPJ
			string =
				digits.slice( 0, 2 ) +
				'.' +
				digits.slice( 2, 5 ) +
				'.' +
				digits.slice( 5, 8 ) +
				'/' +
				digits.slice( 8, 12 ) +
				'-' +
				digits.slice( 12, 14 );
		} else {
			// CPF
			string =
				digits.slice( 0, 3 ) +
				'.' +
				digits.slice( 3, 6 ) +
				'.' +
				digits.slice( 6, 9 ) +
				'-' +
				digits.slice( 9, 11 );
		}

		return string.replace( /^[\s\.\-]+|[\s\.\-]+$/g, '' );
	},

	unmask: identity,
};

/**
 * Formats a field value
 *
 * @param {string} fieldName name of field corresponding to a child open of `fieldMasks`
 * @param {string} previousValue the current value of the field before change
 * @param {string} nextValue the new, incoming value of the field on change
 * @returns {string} formatted value
 */
export function maskField( fieldName, previousValue, nextValue ) {
	const fieldMask = fieldMasks[ fieldName ];
	if ( ! fieldMask ) {
		return nextValue;
	}

	return fieldMask.mask( previousValue, nextValue );
}

/**
 * Reverses masking formats of a field value
 *
 * @param {string} fieldName name of field corresponding to a child open of `fieldMasks`
 * @param {string} previousValue the current value of the field before change
 * @param {string} nextValue the new, incoming value of the field on change
 * @returns {string} deformatted value
 */
export function unmaskField( fieldName, previousValue, nextValue ) {
	const fieldMask = fieldMasks[ fieldName ];
	if ( ! fieldMask ) {
		return nextValue;
	}

	return fieldMask.unmask( fieldMask.mask( previousValue, nextValue ) );
}
