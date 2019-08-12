/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import React, { useEffect, useState } from 'react';
import { loadScript } from '@automattic/load-script';
import { injectStripe, StripeProvider, Elements } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import { getStripeConfiguration } from 'lib/store-transactions';

const debug = debugFactory( 'calypso:stripe' );

/**
 * An error for display by the payment form
 *
 * On top of the standard `message` string property, this error will include
 * the `code` property.
 *
 * This object also includes a `messagesByField` property which can be used to
 * find which error was for which input field.
 *
 * @param {string} code - The error code
 * @param {object} messagesByField - An object whose keys are input field names and whose values are arrays of error strings for that field
 */
function StripeValidationError( code, messagesByField ) {
	const fields = Object.keys( messagesByField );
	const firstMessage = fields.length ? messagesByField[ fields[ 0 ] ] : code;
	this.message = firstMessage;
	this.code = code;
	this.messagesByField = messagesByField;
}
StripeValidationError.prototype = new Error();
export { StripeValidationError };

/**
 * An error related to a Setup Intent
 *
 * If this error is thrown, the setup intent probably needs to be recreated
 * before being used again.
 *
 * The object will include the original stripe error in the stripeError prop.
 *
 * @param {object} stripeError - The original Stripe error object
 */
function StripeSetupIntentError( stripeError ) {
	this.stripeError = stripeError;
	this.message = stripeError.message;
}
StripeSetupIntentError.prototype = new Error();
export { StripeSetupIntentError };

/**
 * Create a Stripe PaymentMethod using Stripe Elements
 *
 * paymentDetails should include data not gathered by Stripe Elements. For
 * example, `name` (string), `address` (object with `country` [string] and
 * `postal_code` [string]).
 *
 * On success, the Promise will be resolved with an object that contains the
 * PaymentMethod token in the `id` field.
 *
 * If there is an error, it will include a `message` field which can be used to
 * display the error. It will also include a `type` and possibly other fields
 * depending on the type. For example, validation errors should be type
 * `validation_error` and have a `code` property which might be something like
 * `incomplete_cvc`.
 *
 * @param {object} stripe The stripe object with payment data included
 * @param {object} paymentDetails The `billing_details` field of the `createPaymentMethod()` request
 * @return {Promise} Promise that will be resolved or rejected
 */
export async function createStripePaymentMethod( stripe, paymentDetails ) {
	debug( 'creating payment method...', paymentDetails );
	const { paymentMethod, error } = await stripe.createPaymentMethod( 'card', {
		billing_details: paymentDetails,
	} );
	debug( 'payment method creation complete', paymentMethod, error );
	if ( error ) {
		// Note that this is a promise rejection
		if ( error.type === 'validation_error' ) {
			throw new StripeValidationError(
				error.code,
				getValidationErrorsFromStripeError( error ) || {}
			);
		}
		throw new Error( error.message );
	}
	return paymentMethod;
}

export async function createStripeSetupIntent( stripe, stripeConfiguration, paymentDetails ) {
	debug( 'creating setup intent...', paymentDetails );
	const { setupIntent, error } = await stripe.handleCardSetup(
		stripeConfiguration.setup_intent_id,
		{
			payment_method_data: {
				billing_details: paymentDetails,
			},
		}
	);
	debug( 'setup intent creation complete', setupIntent, error );
	if ( error ) {
		// Note that this is a promise rejection
		if ( error.type === 'validation_error' ) {
			throw new StripeValidationError(
				error.code,
				getValidationErrorsFromStripeError( error ) || {}
			);
		}
		throw new StripeSetupIntentError( error );
	}
	return setupIntent;
}

/**
 * Confirm any PaymentIntent from Stripe response and carry out 3DS or
 * other next_actions if they are required.
 *
 * If there is an error, it will include a `message` field which can be used to
 * display the error. It will also include a `type` and possibly other fields
 * depending on the type.
 *
 * @param {object} stripeConfiguration The data from the Stripe Configuration endpoint
 * @param {string} paymentIntentClientSecret The client secret of the PaymentIntent
 * @return {Promise} Promise that will be resolved or rejected
 */
export async function confirmStripePaymentIntent( stripeConfiguration, paymentIntentClientSecret ) {
	debug( 'Confirming paymentIntent...', paymentIntentClientSecret );

	// Setup a stripe instance that is disconnected from our Elements
	// Otherwise, we'll create another paymentMethod, which we don't want
	const standAloneStripe = window.Stripe( stripeConfiguration.public_key );

	const { paymentIntent, error } = await standAloneStripe.handleCardPayment(
		paymentIntentClientSecret,
		{}
	);
	if ( error ) {
		// Note that this is a promise rejection
		throw new Error( error );
	}

	return paymentIntent;
}

/**
 * Extract validation errors from a Stripe error
 *
 * Returns null if validation errors cannot be found.
 *
 * @param {object} error An error returned by a Stripe function like createPaymentMethod
 * @return {object | null} An object keyed by input field name whose values are arrays of error strings for that field
 */
function getValidationErrorsFromStripeError( error ) {
	if ( error.type !== 'validation_error' || ! error.code ) {
		return null;
	}
	switch ( error.code ) {
		case 'incomplete_number':
		case 'invalid_number':
			return {
				card_number: [ error.message ],
			};
		case 'incomplete_cvc':
		case 'invalid_cvc':
			return {
				card_cvc: [ error.message ],
			};
		case 'incomplete_expiry':
		case 'invalid_expiry':
			return {
				card_expiry: [ error.message ],
			};
	}
	return null;
}

/**
 * React custom Hook for loading stripeJs
 *
 * Its parameter is the value returned by useStripeConfiguration
 *
 * @param {object} stripeConfiguration An object containing { public_key, js_url }
 * @return {object} { stripeJs, isStripeLoading }
 */
export function useStripeJs( stripeConfiguration ) {
	const [ stripeJs, setStripeJs ] = useState( null );
	const [ isStripeLoading, setStripeLoading ] = useState( true );
	useEffect( () => {
		if ( ! stripeConfiguration ) {
			return;
		}
		try {
			if ( window.Stripe ) {
				debug( 'stripe.js already loaded' );
				setStripeLoading( false );
				if ( ! stripeJs ) {
					setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
				}
				return;
			}
			debug( 'loading stripe.js...' );
			loadScript( stripeConfiguration.js_url, function( error ) {
				if ( error ) {
					debug( 'stripe.js script ' + error.src + ' failed to load.' );
					return;
				}
				debug( 'stripe.js loaded!' );
				setStripeLoading( false );
				setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
			} );
		} catch ( error ) {
			if ( error ) {
				debug( 'error while loading stripeJs', error );
				setStripeLoading( false );
				return;
			}
		}
	}, [ stripeConfiguration, stripeJs ] );
	return { stripeJs, isStripeLoading };
}

/**
 * React custom Hook for loading the Stripe Configuration
 *
 * @param {object} requestArgs (optional) Can include `country` or `needs_intent`
 * @return {object} Stripe Configuration as returned by the stripe configuration endpoint
 */
export function useStripeConfiguration( requestArgs = {} ) {
	const [ stripeError, setStripeError ] = useState();
	const [ stripeConfiguration, setStripeConfiguration ] = useState();
	useEffect( () => {
		getStripeConfiguration( requestArgs ).then( configuration =>
			setStripeConfiguration( configuration )
		);
	}, [ requestArgs, stripeError ] );
	return { stripeConfiguration, setStripeError };
}

/**
 * HOC to render a component with StripeJs
 *
 * The wrapped component will receieve the additional props:
 *
 * - stripe (the stripe.js object)
 * - stripeConfiguration (the results of the stripe-configuration endpoint)
 * - isStripeLoading (true while the other two props are still loading)
 *
 * @param {object} WrappedComponent The component to wrap
 * @param {object} configurationArgs (optional) Options for configuration endpoint request. Can include `country` or `needs_intent`
 * @return {object} WrappedComponent
 */
export function withStripe( WrappedComponent, configurationArgs = {} ) {
	const StripeInjectedWrappedComponent = injectStripe( WrappedComponent );
	return props => {
		const { stripeConfiguration, setStripeError } = useStripeConfiguration( configurationArgs );
		const { stripeJs, isStripeLoading } = useStripeJs( stripeConfiguration );

		return (
			<StripeProvider stripe={ stripeJs }>
				<Elements>
					<StripeInjectedWrappedComponent
						stripeConfiguration={ stripeConfiguration }
						isStripeLoading={ isStripeLoading }
						setStripeError={ setStripeError }
						{ ...props }
					/>
				</Elements>
			</StripeProvider>
		);
	};
}
