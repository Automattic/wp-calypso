/** @format */
/**
 * External dependencies
 */
import creditcards from 'creditcards';
import { capitalize, compact, isArray, isEmpty, mergeWith, union } from 'lodash';
import i18n from 'i18n-calypso';
import { isValidPostalCode } from 'lib/postal-code';
import phone from 'phone';

/**
 * Internal dependencies
 */
import {
	isEbanxCreditCardProcessingEnabledForCountry,
	isValidCPF,
	ebanxFieldRules,
} from 'lib/checkout/ebanx';

/**
 * Returns the credit card validation rule set
 * @param {object} additionalFieldRules custom validation rules depending on jurisdiction or other variable
 * @returns {object} the ruleset
 */
export function getCreditCardFieldRules() {
	return {
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
	};
}

/**
 * Returns the tef payment validation rule set
 * See: client/my-sites/checkout/checkout/redirect-payment-box.jsx
 * @returns {object} the ruleset
 */
export function tefPaymentFieldRules() {
	return Object.assign(
		{
			name: {
				description: i18n.translate( 'Your Name' ),
				rules: [ 'required' ],
			},

			'tef-bank': {
				description: i18n.translate( 'Bank' ),
				rules: [ 'required' ],
			},
		},
		ebanxFieldRules( 'BR' )
	);
}

/**
 * Returns the token validation rule set
 * @returns {object} the ruleset
 */
export function tokenFieldRules() {
	return {
		name: {
			description: i18n.translate( 'Name on Card', {
				comment: 'Upgrades: Card holder name label on credit card form',
			} ),
			rules: [ 'required' ],
		},

		tokenized_payment_data: {
			description: i18n.translate( 'Tokenized Payment Data', {
				comment: 'Upgrades: Tokenized payment data from the token provider',
			} ),
			rules: [ 'required' ],
		},
	};
}

/**
 * Returns a validation ruleset to use for the given payment type
 * @param {object} paymentDetails object containing fieldname/value keypairs
 * @param {string} paymentType credit-card(default)|paypal|ideal|p24|tef|token
 * @returns {object|null} the ruleset
 */
export function paymentFieldRules( paymentDetails, paymentType ) {
	switch ( paymentType ) {
		case 'credit-card':
			return mergeValidationRules(
				getCreditCardFieldRules(),
				getConditionalCreditCardRules( paymentDetails ),
				getEbanxCreditCardRules( paymentDetails )
			);
		case 'brazil-tef':
			return tefPaymentFieldRules();
		case 'token':
			return tokenFieldRules();
		default:
			return null;
	}
}

/**
 * Returns arguments deep-merged into one object with any array values
 * concatentated and deduped
 * @param {object}* rulesets Objects describing the rulesets to be combined
 * @returns {object} The aggregated ruleset
 */
export function mergeValidationRules( ...rulesets ) {
	return mergeWith(
		{},
		...rulesets,
		( objValue, srcValue ) =>
			isArray( objValue ) && isArray( srcValue ) ? union( objValue, srcValue ) : undefined
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
		return i18n.translate( 'Missing required %(description)s field', {
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

validators.validPostalCodeUS = {
	isValid: value => isValidPostalCode( value, 'US' ),
	error: function( description ) {
		return i18n.translate( '%(description)s is invalid. Must be a 5 digit number', {
			args: { description: description },
		} );
	},
};

validators.validPhone = {
	isValid( phoneNumber, paymentDetails ) {
		if ( ! phoneNumber ) {
			return false;
		}

		return phone( phoneNumber, paymentDetails.country ).length > 0;
	},
	error: function() {
		return i18n.translate( 'That phone number does not appear to be valid' );
	},
};

validators.validStreetNumber = {
	isValid( streetNumber ) {
		return streetNumber !== '0';
	},
	error: validationError,
};

/**
 * Runs payment fields through the relevant validation rules
 * use these validation rules, for example, in <CreditCardForm />, <PayPalPaymentBox /> and <RedirectPaymentBox />
 * @param {object} paymentDetails object containing fieldname/value keypairs
 * @param {string} paymentType credit-card(default)|paypal|ideal|p24|tef|token
 * @returns {object} validation errors, if any
 */
export function validatePaymentDetails( paymentDetails, paymentType = 'credit-card' ) {
	const rules = paymentFieldRules( paymentDetails, paymentType );
	let errors = [];
	if ( rules ) {
		errors = Object.keys( rules ).reduce( function( allErrors, fieldName ) {
			const field = rules[ fieldName ],
				newErrors = getErrors( field, paymentDetails[ fieldName ], paymentDetails );

			if ( newErrors.length ) {
				allErrors[ fieldName ] = newErrors;
			}

			return allErrors;
		}, {} );
	}
	return { errors };
}

/**
 * Retrieves the type of credit card from the specified number.
 *
 * @param {string} number - credit card number
 * @returns {string|null} the type of the credit card
 * @see {@link http://en.wikipedia.org/wiki/Bank_card_number} for more information
 */
export function getCreditCardType( number ) {
	if ( number ) {
		number = number.replace( / /g, '' );

		let cardType = creditcards.card.type( number, true );

		if ( typeof cardType === 'undefined' ) {
			return null;
		}

		// We already use 'amex' for American Express everywhere else
		if ( cardType === 'American Express' ) {
			cardType = 'amex';
		}

		// Normalize Diners as well
		if ( cardType === 'Diners Club' ) {
			cardType = 'diners';
		}

		return cardType.toLowerCase();
	}

	return null;
}

/**
 *
 * @param {string} field the name of the field
 * @param {value} value the value of the field
 * @param {object} paymentDetails object containing fieldname/value keypairs
 * @returns {array} array of errors found, if any
 */
function getErrors( field, value, paymentDetails ) {
	return compact(
		field.rules.map( function( rule ) {
			const validator = getValidator( rule );

			if ( ! validator.isValid( value, paymentDetails ) ) {
				return validator.error( field.description );
			}
		} )
	);
}

function getEbanxCreditCardRules( { country } ) {
	return (
		country && isEbanxCreditCardProcessingEnabledForCountry( country ) && ebanxFieldRules( country )
	);
}

/**
 *
 * @param {object} cardDetails - a map of credit card field key value pairs
 * @returns {object|null} If match is found,
 * an object containing rule sets for specific credit card processing providers,
 * otherwise `null`
 */
function getConditionalCreditCardRules( { country } ) {
	switch ( country ) {
		case 'US':
			return {
				'postal-code': {
					description: i18n.translate( 'Postal Code', {
						context: 'Upgrades: Postal code on credit card form',
					} ),
					rules: [ 'required', 'validPostalCodeUS' ],
				},
			};
	}

	return null;
}

function getValidator( rule ) {
	if ( isArray( rule ) ) {
		return validators[ rule[ 0 ] ].apply( null, rule.slice( 1 ) );
	}

	return validators[ rule ];
}
