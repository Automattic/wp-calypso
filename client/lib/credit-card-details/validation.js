/** @format */
/**
 * External dependencies
 */
import creditcards from 'creditcards';
import capitalize from 'lodash/capitalize';
import compact from 'lodash/compact';
import inRange from 'lodash/inRange';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEbanxEnabledForCountry, isValidCPF } from 'lib/credit-card-details/ebanx';
import { PAYMENT_PROCESSOR_EBANX_COUNTRIES } from './constants';

function ebanxFieldRules( country ) {
	const requiredFields = PAYMENT_PROCESSOR_EBANX_COUNTRIES[ country ].requiredFields || [];

	return pick(
		{
			document: {
				description: i18n.translate( 'Taxpayer Identification Number' ),
				rules: [ 'validCPF' ],
			},

			'street-number': {
				description: i18n.translate( 'Street Number' ),
				rules: [ 'required' ],
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
				rules: [ 'required' ],
			},
		},
		requiredFields
	);
}

function creditCardFieldRules( additionalFieldRules = {} ) {
	return Object.assign(
		{
			name: {
				description: i18n.translate( 'Name on Card', {
					context: 'Upgrades: Card holder name label on credit card form',
				} ),
				rules: [ 'required' ],
			},

			number: {
				description: i18n.translate( 'Card Number', {
					context: 'Upgrades: Card number label on credit card form',
				} ),
				rules: [ 'validCreditCardNumber' ],
			},

			'expiration-date': {
				description: i18n.translate( 'Credit Card Expiration Date' ),
				rules: [ 'validExpirationDate' ],
			},

			cvv: {
				description: i18n.translate( 'Credit Card CVV Code' ),
				rules: [ 'validCvvNumber' ],
			},

			country: {
				description: i18n.translate( 'Country' ),
				rules: [ 'required' ],
			},

			'postal-code': {
				description: i18n.translate( 'Postal Code', {
					context: 'Upgrades: Postal code on credit card form',
				} ),
				rules: [ 'required' ],
			},
		},
		additionalFieldRules
	);
}

function parseExpiration( value ) {
	const [ month, year ] = value.split( '/' );
	return {
		month: creditcards.expiration.month.parse( month ),
		year: creditcards.expiration.year.parse( year, true ),
	};
}

function validationError( description ) {
	return i18n.translate( '%(description)s is invalid', {
		args: { description: capitalize( description ) },
	} );
}

const validators = {};

validators.required = {
	isValid( value ) {
		return ! isEmpty( value );
	},

	error: function( description ) {
		return i18n.translate( '%(description)s is a required field', {
			args: { description: description },
		} );
	},
};

validators.validCreditCardNumber = {
	isValid( value ) {
		if ( ! value ) {
			return false;
		}
		return creditcards.card.isValid( value );
	},
	error: validationError,
};

validators.validCvvNumber = {
	isValid( value ) {
		if ( ! value ) {
			return false;
		}
		return creditcards.cvc.isValid( value );
	},
	error: validationError,
};

validators.validExpirationDate = {
	isValid: function( value ) {
		if ( ! value ) {
			return false;
		}
		const expiration = parseExpiration( value );

		return (
			creditcards.expiration.month.isValid( expiration.month ) &&
			creditcards.expiration.year.isValid( expiration.year ) &&
			! creditcards.expiration.isPast( expiration.month, expiration.year )
		);
	},
	error: validationError,
};

validators.validCPF = {
	isValid( value ) {
		if ( ! value ) {
			return false;
		}
		return isValidCPF( value );
	},
	error: function( description ) {
		return i18n.translate( '%(description)s is invalid. Must be in format: 111.444.777-XX', {
			args: { description: description },
		} );
	},
};

export function validateCardDetails( cardDetails ) {
	const rules = creditCardFieldRules( getAdditionalFieldRules( cardDetails ) ),
		errors = Object.keys( rules ).reduce( function( allErrors, fieldName ) {
			const field = rules[ fieldName ],
				newErrors = getErrors( field, cardDetails[ fieldName ], cardDetails );

			if ( newErrors.length ) {
				allErrors[ fieldName ] = newErrors;
			}

			return allErrors;
		}, {} );

	return { errors: errors };
}

/**
 * Retrieves the type of credit card from the specified number.
 *
 * @param {string} number - credit card number
 * @returns {string} the type of the credit card
 * @see {@link http://en.wikipedia.org/wiki/Bank_card_number} for more information
 */
export function getCreditCardType( number ) {
	if ( number ) {
		number = number.replace( / /g, '' );

		if ( number.match( /^3[47]\d{0,13}$/ ) ) {
			return 'amex';
		} else if ( number.match( /^4\d{0,12}$/ ) || number.match( /^4\d{15}$/ ) ) {
			return 'visa';
		} else if (
			number.match( /^5[1-5]\d{0,14}|^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d\d|7(?:[01]\d|20))\d{0,12}$/ )
		) {
			//valid 2-series range: 2221 - 2720
			//valid 5-series range: 51 - 55
			return 'mastercard';
		} else if (
			number.match( /^6011\d{0,12}$/ ) ||
			inRange( parseInt( number, 10 ), 622126, 622926 ) || // valid range is 622126-622925
			number.match( /^64[4-9]\d{0,13}$/ ) ||
			number.match( /^65\d{0,14}$/ )
		) {
			return 'discover';
		}
	}

	return null;
}

function getErrors( field, value, cardDetails ) {
	return compact(
		field.rules.map( function( rule ) {
			const validator = getValidator( rule );

			if ( ! validator.isValid( value, cardDetails ) ) {
				return validator.error( field.description );
			}
		} )
	);
}

/**
 *
 * @param {object} cardDetails - a map of credit card field key value pairs
 * @returns {object|null} If match is found,
 * an object containing rule sets for specific credit card processing providers,
 * otherwise `null`
 */
function getAdditionalFieldRules( { country } ) {
	if ( isEbanxEnabledForCountry( country ) ) {
		return ebanxFieldRules( country );
	}
	return null;
}

function getValidator( rule ) {
	if ( isArray( rule ) ) {
		return validators[ rule[ 0 ] ].apply( null, rule.slice( 1 ) );
	}

	return validators[ rule ];
}
