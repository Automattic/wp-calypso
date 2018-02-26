/** @format */
/**
 * External dependencies
 */
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { getCreditCardType } from 'lib/credit-card-details';

const fieldMasks = {};

fieldMasks[ 'expiration-date' ] = {
	mask: function( previousValue, nextValue ) {
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

export const formatAmexCreditCard = function( cardNumber ) {
	const digits = cardNumber.replace( /[^0-9]/g, '' ).slice( 0, 15 );
	const formattedNumber = `${ digits.slice( 0, 4 ) } ${ digits.slice( 4, 10 ) } ${ digits.slice(
		10,
		15
	) }`;
	return formattedNumber.trim();
};

export const formatCreditCard = function( cardNumber ) {
	if ( getCreditCardType( cardNumber ) === 'amex' ) {
		return formatAmexCreditCard( cardNumber );
	}
	const digits = cardNumber.replace( /[^0-9]/g, '' ).slice( 0, 19 );
	const formattedNumber = `${ digits.slice( 0, 4 ) } ${ digits.slice( 4, 8 ) } ${ digits.slice(
		8,
		12
	) } ${ digits.slice( 12 ) }`;
	return formattedNumber.trim();
};

fieldMasks.number = {
	mask: function( previousValue, nextValue ) {
		return formatCreditCard( nextValue );
	},

	unmask: function( value ) {
		return value.replace( / /g, '' );
	},
};

fieldMasks.cvv = {
	mask: function( previousValue, nextValue ) {
		return nextValue.replace( /[^\d]/g, '' ).substring( 0, 4 );
	},

	unmask: identity,
};

// `document` is an EBANX field. Currently used for Brazilian CPF numbers
// See isValidCPF() / ebanx.js
fieldMasks.document = {
	mask: function( previousValue, nextValue ) {
		const digits = nextValue.replace( /[^0-9]/g, '' ),
			string =
				digits.slice( 0, 3 ) +
				'.' +
				digits.slice( 3, 6 ) +
				'.' +
				digits.slice( 6, 9 ) +
				'-' +
				digits.slice( 9, 11 );

		return string.replace( /^[\s\.\-]+|[\s\.\-]+$/g, '' );
	},

	unmask: identity,
};

export function maskField( fieldName, previousValue, nextValue ) {
	const fieldMask = fieldMasks[ fieldName ];
	if ( ! fieldMask ) {
		return nextValue;
	}

	return fieldMask.mask( previousValue, nextValue );
}

export function unmaskField( fieldName, previousValue, nextValue ) {
	const fieldMask = fieldMasks[ fieldName ];
	if ( ! fieldMask ) {
		return nextValue;
	}

	return fieldMask.unmask( fieldMask.mask( previousValue, nextValue ) );
}
