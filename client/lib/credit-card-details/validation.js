/**
 * External dependencies
 */
var creditcards = require( 'creditcards' ),
	compact = require( 'lodash/compact' ),
	isArray = require( 'lodash/isArray' ),
	isEmpty = require( 'lodash/isEmpty' ),
	toArray = require( 'lodash/toArray' ),
	inRange = require( 'lodash/inRange' ),
	capitalize = require( 'lodash/capitalize' ),
	i18n = require( 'i18n-calypso' );

function creditCardFieldRules() {
	return {
		name: {
			description: i18n.translate( 'Name on Card', {
				context: 'Upgrades: Card holder name label on credit card form',
				textOnly: true
			} ),
			rules: [ 'required' ]
		},

		number: {
			description: i18n.translate( 'Card Number', {
				context: 'Upgrades: Card number label on credit card form',
				textOnly: true
			} ),
			rules: [ 'required', 'validCreditCardNumber' ]
		},

		'expiration-date': {
			description: i18n.translate( 'Credit Card Expiration Date' ),
			rules: [ 'required', 'validExpirationDate' ]
		},

		cvv: {
			description: i18n.translate( 'Credit Card CVV Code' ),
			rules: [ 'required', 'validCvvNumber' ]
		},

		country: {
			description: i18n.translate( 'Country' ),
			rules: [ 'required' ]
		},

		'postal-code': {
			description: i18n.translate( 'Postal Code', {
				context: 'Upgrades: Postal code on credit card form',
				textOnly: true
			} ),
			rules: [ 'required' ]
		}
	};
}

var validators = {};

validators.required = {
	isValid: function( value ) {
		return ! isEmpty( value );
	},

	error: function( description ) {
		return i18n.translate( 'Missing required %(description)s field', {
			args: { description: description }
		} );
	}
};

validators.validCreditCardNumber = creditCardValidator( 'validCardNumber' );

validators.validCvvNumber = creditCardValidator( 'validCvc' );

validators.validExpirationDate = creditCardValidator(
	'validExpirationMonth',
	'validExpirationYear'
);

function validateCreditCard( cardDetails ) {
	var expirationDate = cardDetails[ 'expiration-date' ] || '/',
		expirationMonth = parseInt( expirationDate.split( '/' )[0], 10 ),
		expirationYear = parseInt( expirationDate.split( '/' )[1], 10 );

	return creditcards.validate( {
		number: cardDetails.number,
		expirationMonth: expirationMonth,
		expirationYear: expirationYear,
		cvc: cardDetails.cvv
	} );
}

function creditCardValidator( /* validationProperties... */ ) {
	var validationProperties = toArray( arguments );

	return {
		isValid: function( value, cardDetails ) {
			var validationResult;
			if ( ! value ) {
				return false;
			}

			validationResult = validateCreditCard( cardDetails );

			return validationProperties.every( function( property ) {
				return validationResult[ property ];
			} );
		},

		error: function( description ) {
			return i18n.translate( '%(description)s is invalid', {
				args: { description: capitalize( description ) }
			} );
		}
	};
}


function validateCardDetails( cardDetails ) {
	var rules = creditCardFieldRules(),
		errors = Object.keys( rules ).reduce( function( allErrors, fieldName ) {
		var field = rules[ fieldName ],
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
function getCreditCardType( number ) {
	if ( number ) {
		number = number.replace( / /g, '' );

		if ( number.match( /^3[47]\d{0,13}$/ ) ) {
			return 'amex';
		} else if ( number.match( /^4\d{0,12}$/ ) || number.match( /^4\d{15}$/ ) ) {
			return 'visa';
		} else if ( number.match( /^5[1-5]\d{0,14}$/ ) ) {
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
	return compact( field.rules.map( function( rule ) {
		var validator = getValidator( rule );

		if ( ! validator.isValid( value, cardDetails ) ) {
			return validator.error( field.description );
		}
	} ) );
}

function getValidator( rule ) {
	if ( isArray( rule ) ) {
		return validators[ rule[ 0 ] ].apply( null, rule.slice( 1 ) );
	} else {
		return validators[ rule ];
	}
}

module.exports = {
	getCreditCardType: getCreditCardType,
	validateCardDetails: validateCardDetails
};
