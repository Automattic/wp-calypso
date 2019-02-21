/** @format */

/**
 * External dependencies
 */

import { isEmpty, omit } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:store-transactions' );
import inherits from 'inherits';

/**
 * Internal dependencies
 */
import paymentGatewayLoader from 'lib/payment-gateway-loader';
import { validatePaymentDetails } from 'lib/checkout';
import {
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	REDIRECTING_FOR_AUTHORIZATION,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from './step-types';
import wp from 'lib/wp';
import {
	isEbanxCreditCardProcessingEnabledForCountry,
	translatedEbanxError,
} from 'lib/checkout/ebanx';
import analytics from 'lib/analytics';

const wpcom = wp.undocumented();

/**
 * Make a purchase on WordPress.com.
 *
 * @returns {Readable} A stream of transaction flow steps.
 *
 * @param {object} params - Includes the cart, domainDetails etc...
 * @param {function} onStep - Callback
 */
export function submit( params, onStep ) {
	return new TransactionFlow( params, onStep );
}

function ValidationError( code, message ) {
	this.code = code;
	this.message = message;
}
inherits( ValidationError, Error );

function TransactionFlow( initialData, onStep ) {
	this._initialData = initialData;
	this._onStep = onStep;

	const paymentMethod = this._initialData.payment.paymentMethod;
	const paymentHandler = this._paymentHandlers[ paymentMethod ];
	if ( ! paymentHandler ) {
		throw new Error( 'Invalid payment method: ' + paymentMethod );
	}

	paymentHandler.call( this );
}

TransactionFlow.prototype._pushStep = function( options ) {
	const defaults = {
		first: false,
		last: false,
		timestamp: Date.now(),
	};

	this._onStep( Object.assign( defaults, options ) );
};

TransactionFlow.prototype._paymentHandlers = {
	WPCOM_Billing_MoneyPress_Stored: function() {
		const {
				mp_ref: payment_key,
				stored_details_id,
				payment_partner,
			} = this._initialData.payment.storedCard,
			{ successUrl, cancelUrl } = this._initialData;

		this._pushStep( { name: INPUT_VALIDATION, first: true } );
		debug( 'submitting transaction with stored card' );
		this._submitWithPayment( {
			payment_method: 'WPCOM_Billing_MoneyPress_Stored',
			payment_key,
			payment_partner,
			stored_details_id,
			successUrl,
			cancelUrl,
		} );
	},

	WPCOM_Billing_MoneyPress_Paygate: function() {
		const { newCardDetails } = this._initialData.payment,
			{ successUrl, cancelUrl } = this._initialData,
			paymentType = newCardDetails.tokenized_payment_data ? 'token' : undefined,
			validation = validatePaymentDetails( newCardDetails, paymentType );

		if ( ! isEmpty( validation.errors ) ) {
			this._pushStep( {
				name: INPUT_VALIDATION,
				error: new ValidationError( 'invalid-card-details', validation.errors ),
				first: true,
				last: true,
			} );
			return;
		}

		this._pushStep( { name: INPUT_VALIDATION, first: true } );
		debug( 'submitting transaction with new card' );

		this._createCardToken(
			function( gatewayData ) {
				const { name, country, 'postal-code': zip } = newCardDetails;

				let paymentData = {
					payment_method: gatewayData.paymentMethod,
					payment_key: gatewayData.token,
					name,
					zip,
					country,
					successUrl,
					cancelUrl,
				};

				if ( isEbanxCreditCardProcessingEnabledForCountry( country ) ) {
					const ebanxPaymentData = {
						state: newCardDetails.state,
						city: newCardDetails.city,
						address_1: newCardDetails[ 'address-1' ],
						address_2: newCardDetails[ 'address-2' ],
						street_number: newCardDetails[ 'street-number' ],
						phone_number: newCardDetails[ 'phone-number' ],
						document: newCardDetails.document,
						device_id: gatewayData.deviceId,
					};

					paymentData = { ...paymentData, ...ebanxPaymentData };
				}

				this._submitWithPayment( paymentData );
			}.bind( this )
		);
	},

	WPCOM_Billing_WPCOM: function() {
		this._pushStep( { name: INPUT_VALIDATION, first: true } );
		this._submitWithPayment( { payment_method: 'WPCOM_Billing_WPCOM' } );
	},
};

TransactionFlow.prototype._createCardToken = function( callback ) {
	this._pushStep( { name: SUBMITTING_PAYMENT_KEY_REQUEST } );

	createCardToken(
		'new_purchase',
		this._initialData.payment.newCardDetails,
		function( error, cardToken ) {
			if ( error ) {
				return this._pushStep( {
					name: RECEIVED_PAYMENT_KEY_RESPONSE,
					error: error,
					last: true,
				} );
			}

			this._pushStep( { name: RECEIVED_PAYMENT_KEY_RESPONSE } );
			callback( cardToken );
		}.bind( this )
	);
};

TransactionFlow.prototype._submitWithPayment = function( payment ) {
	const transaction = {
		cart: omit( this._initialData.cart, [ 'messages' ] ), // messages contain reference to DOMNode
		domain_details: this._initialData.domainDetails,
		payment: payment,
	};

	this._pushStep( { name: SUBMITTING_WPCOM_REQUEST } );
	wpcom.transactions( 'POST', transaction, ( error, data ) => {
		if ( error ) {
			return this._pushStep( {
				name: RECEIVED_WPCOM_RESPONSE,
				error,
				last: true,
			} );
		}

		if ( data.redirect_url ) {
			return this._pushStep( {
				name: REDIRECTING_FOR_AUTHORIZATION,
				data: data,
				last: true,
			} );
		}

		this._pushStep( {
			name: RECEIVED_WPCOM_RESPONSE,
			data,
			last: true,
		} );
	} );
};

function createPaygateToken( requestType, cardDetails, callback ) {
	debug( 'creating token with Paygate' );
	wpcom.paygateConfiguration(
		{
			request_type: requestType,
			country: cardDetails.country,
			card_brand: cardDetails.brand,
		},
		function( configError, configuration ) {
			if ( configError ) {
				callback( configError );
				return;
			}

			paymentGatewayLoader
				.ready( configuration.js_url, 'Paygate' )
				.then( Paygate => {
					Paygate.setProcessor( configuration.processor );
					Paygate.setApiUrl( configuration.api_url );
					Paygate.setPublicKey( configuration.public_key );
					Paygate.setEnvironment( configuration.environment );

					const parameters = getPaygateParameters( cardDetails );
					Paygate.createToken( parameters, onSuccess, onFailure );
				} )
				.catch( loaderError => {
					callback( loaderError );
				} );
		}
	);

	function onSuccess( data ) {
		if ( data.is_error ) {
			return callback( new Error( 'Paygate Response Error: ' + data.error_msg ) );
		}

		data.paymentMethod = 'WPCOM_Billing_MoneyPress_Paygate';

		callback( null, data );
	}

	function onFailure() {
		callback( new Error( 'Paygate Request Error' ) );
	}
}

function createEbanxToken( requestType, cardDetails ) {
	debug( 'creating token with ebanx' );

	return new Promise( function( resolve, reject ) {
		wpcom.ebanxConfiguration(
			{
				request_type: requestType,
			},
			function( configError, configuration ) {
				if ( configError ) {
					reject( configError );
				}

				return paymentGatewayLoader
					.ready( configuration.js_url, 'EBANX', false )
					.then( Ebanx => {
						Ebanx.config.setMode( configuration.environment );
						Ebanx.config.setPublishableKey( configuration.public_key );
						Ebanx.config.setCountry( cardDetails.country.toLowerCase() );

						const parameters = getEbanxParameters( cardDetails );
						Ebanx.card.createToken( parameters, function( ebanxResponse ) {
							Ebanx.deviceFingerprint.setup( function( deviceId ) {
								ebanxResponse.data.deviceId = deviceId;
								return createTokenCallback( ebanxResponse, resolve, reject );
							} );
						} );
					} )
					.catch( loaderError => {
						reject( loaderError );
					} );
			}
		);
	} );

	function createTokenCallback( ebanxResponse, resolve, reject ) {
		if ( ebanxResponse.error.hasOwnProperty( 'err' ) ) {
			return reject( translatedEbanxError( ebanxResponse.error.err ) );
		}

		ebanxResponse.data.paymentMethod = 'WPCOM_Billing_Ebanx';
		return resolve( ebanxResponse.data );
	}
}

function getPaygateParameters( cardDetails ) {
	if ( cardDetails.tokenized_payment_data ) {
		return {
			token: {
				name: cardDetails.name,
				zip: cardDetails[ 'postal-code' ],
				country: cardDetails.country,
				...cardDetails.tokenized_payment_data,
			},
		};
	}

	return {
		name: cardDetails.name,
		number: cardDetails.number,
		cvc: cardDetails.cvv,
		zip: cardDetails[ 'postal-code' ],
		country: cardDetails.country,
		exp_month: cardDetails[ 'expiration-date' ].substring( 0, 2 ),
		exp_year: '20' + cardDetails[ 'expiration-date' ].substring( 3, 5 ),
	};
}

function getEbanxParameters( cardDetails ) {
	return {
		card_name: cardDetails.name,
		card_number: cardDetails.number,
		card_cvv: cardDetails.cvv,
		card_due_date:
			cardDetails[ 'expiration-date' ].substring( 0, 2 ) +
			'/20' +
			cardDetails[ 'expiration-date' ].substring( 3, 5 ),
	};
}

export function createCardToken( requestType, cardDetails, callback, forcedPaygate = false ) {
	if ( ! forcedPaygate && isEbanxCreditCardProcessingEnabledForCountry( cardDetails.country ) ) {
		return createEbanxToken( requestType, cardDetails ).then(
			result => callback( null, result ),
			function( reason ) {
				analytics.mc.bumpStat( 'cc_token_fallback', 'ebanx_to_paygate' );
				debug( 'Error creating EBANX token, falling back to paygate', reason );
				return createCardToken( requestType, cardDetails, callback, true );
			}
		);
	}

	return createPaygateToken( requestType, cardDetails, callback );
}

export function hasDomainDetails( transaction ) {
	return ! isEmpty( transaction.domainDetails );
}

export function newCardPayment( newCardDetails ) {
	return {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Paygate',
		newCardDetails: newCardDetails || {},
	};
}

export function storedCardPayment( storedCard ) {
	return {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
		storedCard: storedCard,
	};
}

export const fullCreditsPayment = { paymentMethod: 'WPCOM_Billing_WPCOM' };
