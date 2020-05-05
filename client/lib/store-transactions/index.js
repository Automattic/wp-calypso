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
	MODAL_AUTHORIZATION,
	RECEIVED_AUTHORIZATION_RESPONSE,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from './step-types';
import wp from 'lib/wp';
import {
	isEbanxCreditCardProcessingEnabledForCountry,
	translatedEbanxError,
} from 'lib/checkout/processor-specific';
import {
	createStripePaymentMethod,
	confirmStripePaymentIntent,
	StripeValidationError,
} from 'lib/stripe';

const wpcom = wp.undocumented();

/**
 * Make a purchase on WordPress.com.
 *
 * @returns {Readable} A stream of transaction flow steps.
 *
 * @param {object} params - Includes the cart, domainDetails etc...
 * @param {Function} onStep - Callback
 */
export function submit( params, onStep ) {
	return new TransactionFlow( params, onStep );
}

/**
 * An error for display by the payment form
 *
 * TODO: This sets `message` to an object, which is a non-standard way to use
 * an Error since `Error.message` should be a string. We should set the
 * messagesByField to a separate property and use that instead. See
 * `StripeValidationError` for a better pattern.
 *
 * @param {string} code - The error code
 * @param {object} messagesByField - An object whose keys are input field names and whose values are arrays of error strings for that field
 */
function ValidationError( code, messagesByField ) {
	this.code = code;
	this.message = messagesByField;
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

TransactionFlow.prototype._pushStep = function ( options ) {
	const defaults = {
		first: false,
		last: false,
		timestamp: Date.now(),
	};

	this._onStep( Object.assign( defaults, options ) );
};

TransactionFlow.prototype._paymentHandlers = {
	WPCOM_Billing_MoneyPress_Stored: async function () {
		const {
				mp_ref: payment_key,
				stored_details_id,
				payment_partner,
			} = this._initialData.payment.storedCard,
			{ successUrl, cancelUrl, stripeConfiguration } = this._initialData;

		this._pushStep( { name: INPUT_VALIDATION, first: true } );
		debug( 'submitting transaction with stored card' );
		const response = await this._submitWithPayment( {
			payment_method: 'WPCOM_Billing_MoneyPress_Stored',
			payment_key,
			payment_partner,
			stored_details_id,
			successUrl,
			cancelUrl,
		} );

		// Authentication via modal screen
		if ( response && response.message && response.message.payment_intent_client_secret ) {
			await this.stripeModalAuth( stripeConfiguration, response );
		}
	},

	WPCOM_Billing_MoneyPress_Paygate: function () {
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
			function ( gatewayData ) {
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

	WPCOM_Billing_Ebanx: function () {
		const { newCardDetails } = this._initialData.payment;
		const { successUrl, cancelUrl } = this._initialData;
		const paymentType = newCardDetails.tokenized_payment_data ? 'token' : undefined;
		const validation = validatePaymentDetails( newCardDetails, paymentType );

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
		debug( 'submitting transaction with new card (ebanx)' );

		this._createCardToken( ( gatewayData ) => {
			const { name, country, 'postal-code': zip } = newCardDetails;

			// Ebanx payments require additional customer documentation.
			// @see https://developers.ebanx.com/api-reference/ebanx-payment-api/ebanx-payment-guide/guide-create-a-payment/brazil/
			const ebanxPaymentData = {
				payment_method: gatewayData.paymentMethod,
				payment_key: gatewayData.token,
				name,
				zip,
				country,
				successUrl,
				cancelUrl,
				state: newCardDetails.state,
				city: newCardDetails.city,
				address_1: newCardDetails[ 'address-1' ],
				address_2: newCardDetails[ 'address-2' ],
				street_number: newCardDetails[ 'street-number' ],
				phone_number: newCardDetails[ 'phone-number' ],
				document: newCardDetails.document,
				device_id: gatewayData.deviceId,
			};

			this._submitWithPayment( ebanxPaymentData );
		} );
	},

	WPCOM_Billing_WPCOM: function () {
		this._pushStep( { name: INPUT_VALIDATION, first: true } );
		this._submitWithPayment( { payment_method: 'WPCOM_Billing_WPCOM' } );
	},

	WPCOM_Billing_Stripe_Payment_Method: async function () {
		const { newCardDetails } = this._initialData.payment;
		const { successUrl, cancelUrl, stripe, stripeConfiguration } = this._initialData;
		debug( 'validating transaction with new stripe elements card' );
		const validation = validatePaymentDetails( newCardDetails, 'stripe' );

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
		debug( 'submitting transaction with new stripe elements card' );

		const { name, country, 'postal-code': zip, 'phone-number': phone } = newCardDetails;
		const paymentDetailsForStripe = {
			name,
			address: {
				country: country,
				postal_code: zip,
			},
		};

		if ( phone ) {
			paymentDetailsForStripe.phone = phone;
		}

		try {
			const stripePaymentMethod = await createStripePaymentMethod(
				stripe,
				paymentDetailsForStripe
			);
			this._pushStep( { name: RECEIVED_PAYMENT_KEY_RESPONSE } );
			const response = await this._submitWithPayment( {
				payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
				payment_key: stripePaymentMethod.id,
				payment_partner: stripeConfiguration.processor_id,
				name,
				zip,
				country,
				successUrl,
				cancelUrl,
			} );

			// Authentication via modal screen
			if ( response && response.message && response.message.payment_intent_client_secret ) {
				await this.stripeModalAuth( stripeConfiguration, response );
			}
		} catch ( error ) {
			if ( error instanceof StripeValidationError ) {
				debug( 'There was a validation error:', error );
				this._pushStep( {
					name: INPUT_VALIDATION,
					error: new ValidationError( 'invalid-card-details', error.messagesByField ),
					first: true,
					last: true,
				} );
				return;
			}
			this._pushStep( {
				name: RECEIVED_PAYMENT_KEY_RESPONSE,
				error: error.message,
				last: true,
			} );
		}
	},

	WPCOM_Billing_Web_Payment: async function () {
		const { newCardDetails } = this._initialData.payment;
		const { successUrl, cancelUrl, stripeConfiguration } = this._initialData;
		const { name, country, 'postal-code': zip, payment_key } = newCardDetails;
		debug( 'submitting transaction with new stripe elements web payment', this._initialData );

		try {
			if ( ! payment_key ) {
				throw new Error( 'Payment failed. Please try again.' );
			}
			const response = await this._submitWithPayment( {
				// This is functionally the same as a stripe card at this point so we use this payment method
				payment_method: 'WPCOM_Billing_Stripe_Payment_Method',
				payment_key,
				payment_partner: stripeConfiguration.processor_id,
				name,
				zip,
				country,
				successUrl,
				cancelUrl,
			} );
			debug( 'received web payment transaction response', response );

			if ( response && response.message && response.message.payment_intent_client_secret ) {
				await this.stripeModalAuth( stripeConfiguration, response );
			}
		} catch ( error ) {
			this._pushStep( {
				name: RECEIVED_PAYMENT_KEY_RESPONSE,
				error,
				last: true,
			} );
		}
	},
};

TransactionFlow.prototype._createCardToken = function ( callback ) {
	this._pushStep( { name: SUBMITTING_PAYMENT_KEY_REQUEST } );

	createCardToken(
		'new_purchase',
		this._initialData.payment.newCardDetails,
		function ( error, cardToken ) {
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

TransactionFlow.prototype._submitWithPayment = function ( payment ) {
	const transaction = {
		cart: omit( this._initialData.cart, [ 'messages' ] ), // messages contain reference to DOMNode
		domain_details: this._initialData.domainDetails,
		payment,
	};

	this._pushStep( { name: SUBMITTING_WPCOM_REQUEST } );
	return wp
		.undocumented()
		.transactions( transaction )
		.then( ( data ) => {
			if ( data.message ) {
				this._pushStep( { name: MODAL_AUTHORIZATION, data, last: false } );
			} else if ( data.redirect_url ) {
				this._pushStep( { name: REDIRECTING_FOR_AUTHORIZATION, data, last: true } );
			} else {
				this._pushStep( { name: RECEIVED_WPCOM_RESPONSE, data, last: true } );
			}

			return data;
		} )
		.catch( ( error ) => {
			this._pushStep( { name: RECEIVED_WPCOM_RESPONSE, error, last: true } );
			// This should probably reject the error but since the error is already
			// reported just above, that might risk double-reporting or
			// changing the step to the wrong one, so this just resolves
			// without data instead.
		} );
};

TransactionFlow.prototype.stripeModalAuth = async function ( stripeConfiguration, response ) {
	try {
		const authenticationResponse = await confirmStripePaymentIntent(
			stripeConfiguration,
			response.message.payment_intent_client_secret
		);

		if ( authenticationResponse ) {
			this._pushStep( {
				name: RECEIVED_AUTHORIZATION_RESPONSE,
				data: { status: authenticationResponse.status, orderId: response.order_id },
				last: true,
			} );
		}
	} catch ( error ) {
		debug( 'error during stripeModalAuth', error );
		this._pushStep( {
			name: RECEIVED_AUTHORIZATION_RESPONSE,
			error: error.stripeError ? error.stripeError : error.message,
			last: true,
		} );
	}
};

function createPaygateToken( requestType, cardDetails, callback ) {
	debug( 'creating token with Paygate' );
	wpcom.paygateConfiguration(
		{
			request_type: requestType,
			country: cardDetails.country,
			card_brand: cardDetails.brand,
		},
		function ( configError, configuration ) {
			if ( configError ) {
				callback( configError );
				return;
			}

			paymentGatewayLoader
				.ready( configuration.js_url, 'Paygate' )
				.then( ( Paygate ) => {
					Paygate.setProcessor( configuration.processor );
					Paygate.setApiUrl( configuration.api_url );
					Paygate.setPublicKey( configuration.public_key );
					Paygate.setEnvironment( configuration.environment );

					const parameters = getPaygateParameters( cardDetails );
					Paygate.createToken( parameters, onSuccess, onFailure );
				} )
				.catch( ( loaderError ) => {
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

	return new Promise( function ( resolve, reject ) {
		wpcom.ebanxConfiguration(
			{
				request_type: requestType,
			},
			function ( configError, configuration ) {
				if ( configError ) {
					reject( configError );
				}

				return paymentGatewayLoader
					.ready( configuration.js_url, 'EBANX', false )
					.then( ( Ebanx ) => {
						Ebanx.config.setMode( configuration.environment );
						Ebanx.config.setPublishableKey( configuration.public_key );
						Ebanx.config.setCountry( cardDetails.country.toLowerCase() );

						const parameters = getEbanxParameters( cardDetails );
						Ebanx.card.createToken( parameters, function ( ebanxResponse ) {
							Ebanx.deviceFingerprint.setup( function ( deviceId ) {
								ebanxResponse.data.deviceId = deviceId;
								return createTokenCallback( ebanxResponse, resolve, reject );
							} );
						} );
					} )
					.catch( ( loaderError ) => {
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
				card_display_name: cardDetails.card_display_name,
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

export function createCardToken( requestType, cardDetails, callback ) {
	if ( isEbanxCreditCardProcessingEnabledForCountry( cardDetails.country ) ) {
		return createEbanxToken( requestType, cardDetails ).then(
			( result ) => callback( null, result ),
			function ( errorMsg ) {
				return callback( new Error( errorMsg ) );
			}
		);
	}

	return createPaygateToken( requestType, cardDetails, callback );
}

export async function getStripeConfiguration( requestArgs ) {
	const config = await wpcom.stripeConfiguration( requestArgs );
	debug( 'Stripe configuration', config );
	return config;
}
