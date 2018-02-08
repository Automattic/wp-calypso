/** @format */

/**
 * External dependencies
 */

import { isEmpty, omit } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:store-transactions' );
import { Readable } from 'stream';
import inherits from 'inherits';

/**
 * Internal dependencies
 */
import paymentGatewayLoader from 'lib/payment-gateway-loader';
import { validateCardDetails } from 'lib/credit-card-details';
import {
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from './step-types';
import wp from 'lib/wp';
import { isEbanxEnabledForCountry } from 'lib/credit-card-details/ebanx';

const wpcom = wp.undocumented();

/**
 * Make a purchase on WordPress.com.
 *
 * @returns {Readable} A stream of transaction flow steps.
 *
 * @param {CartValue} cart - The current state of the user's shopping cart.
 * @param {object} cardDetails - The credit card being used for this
 * @param {object} domainDetails - Optional domain registration details if the shopping cart contains a domain registration product
 *   transaction.
 */
export function submit( params ) {
	return new TransactionFlow( params );
}

function ValidationError( code, message ) {
	this.code = code;
	this.message = message;
}
inherits( ValidationError, Error );

function TransactionFlow( initialData ) {
	Readable.call( this, { objectMode: true } );
	this._initialData = initialData;
	this._hasStarted = false;
}
inherits( TransactionFlow, Readable );

/**
 * Pushes new data onto the stream. Whenever someone wants to read from the
 * stream of steps, this method will get called because we inherited the
 * functionality of `Readable`.
 *
 * Our goal is to capture the flow of the asynchronous callback functions as a
 * linear sequence of steps. When we get the first request for data, we begin
 * the chain of asynchronous functions. On future requests for data, there is
 * no need to start another asynchronous process, so we just return immediately
 * while the first one finises.
 */
TransactionFlow.prototype._read = function() {
	if ( this._hasStarted ) {
		return false;
	}
	this._hasStarted = true;

	const paymentMethod = this._initialData.payment.paymentMethod;
	const paymentHandler = this._paymentHandlers[ paymentMethod ];
	if ( ! paymentHandler ) {
		throw new Error( 'Invalid payment method: ' + paymentMethod );
	}

	paymentHandler.call( this );
};

TransactionFlow.prototype._pushStep = function( options ) {
	const defaults = {
		first: false,
		last: false,
		timestamp: Date.now(),
	};

	this.push( Object.assign( defaults, options ) );
};

TransactionFlow.prototype._paymentHandlers = {
	WPCOM_Billing_MoneyPress_Stored: function() {
		const {
			mp_ref: payment_key,
			stored_details_id,
			payment_partner,
		} = this._initialData.payment.storedCard;

		this._pushStep( { name: INPUT_VALIDATION, first: true } );
		debug( 'submitting transaction with stored card' );
		this._submitWithPayment( {
			payment_method: 'WPCOM_Billing_MoneyPress_Stored',
			payment_key,
			payment_partner,
			stored_details_id,
		} );
	},

	WPCOM_Billing_MoneyPress_Paygate: function() {
		const { newCardDetails } = this._initialData.payment,
			validation = validateCardDetails( newCardDetails );

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
				};

				if ( isEbanxEnabledForCountry( country ) ) {
					const ebanxPaymentData = {
						state: newCardDetails.state,
						city: newCardDetails.city,
						address_1: newCardDetails[ 'address-1' ],
						address_2: newCardDetails[ 'address-2' ],
						street_number: newCardDetails[ 'street-number' ],
						phone_number: newCardDetails[ 'phone-number' ],
						document: newCardDetails.document,
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
	const onComplete = this.push.bind( this, null ); // End the stream when the transaction has finished
	const transaction = {
		cart: omit( this._initialData.cart, [ 'messages' ] ), // messages contain reference to DOMNode
		domain_details: this._initialData.domainDetails,
		payment: payment,
	};

	this._pushStep( { name: SUBMITTING_WPCOM_REQUEST } );

	wpcom.transactions(
		'POST',
		transaction,
		function( error, data ) {
			if ( error ) {
				return this._pushStep( {
					name: RECEIVED_WPCOM_RESPONSE,
					error: error,
					last: true,
				} );
			}

			this._pushStep( {
				name: RECEIVED_WPCOM_RESPONSE,
				data: data,
				last: true,
			} );
			onComplete();
		}.bind( this )
	);
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
				.ready( configuration.js_url, 'Paygate', true )
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

function createEbanxToken( requestType, cardDetails, callback ) {
	debug( 'creating token with ebanx' );
	wpcom.ebanxConfiguration(
		{
			request_type: requestType,
		},
		function( configError, configuration ) {
			if ( configError ) {
				callback( configError );
				return;
			}

			paymentGatewayLoader
				.ready( configuration.js_url, 'EBANX', false )
				.then( Ebanx => {
					Ebanx.config.setMode( configuration.environment );
					Ebanx.config.setPublishableKey( configuration.public_key );
					Ebanx.config.setCountry( cardDetails.country.toLowerCase() );

					const parameters = getEbanxParameters( cardDetails );
					Ebanx.card.createToken( parameters, createTokenCallback );
				} )
				.catch( loaderError => {
					callback( loaderError );
				} );
		}
	);

	function createTokenCallback( ebanxResponse ) {
		if ( ebanxResponse.data.hasOwnProperty( 'status' ) ) {
			ebanxResponse.data.paymentMethod = 'WPCOM_Billing_Ebanx';
			callback( null, ebanxResponse.data );
		} else {
			const errorMessage =
				ebanxResponse.error.err.status_message || ebanxResponse.error.err.message;
			callback( new Error( 'Credit card Error: ' + errorMessage ) );
		}
	}
}

function getPaygateParameters( cardDetails ) {
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

export function createCardToken( requestType, cardDetails, callback ) {
	if ( isEbanxEnabledForCountry( cardDetails.country ) ) {
		return createEbanxToken( requestType, cardDetails, callback );
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
