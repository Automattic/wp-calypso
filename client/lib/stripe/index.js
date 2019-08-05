/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import { loadScript } from '@automattic/load-script';

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
 * Create a Stripe PaymentMethod using Stripe Elements
 *
 * paymentDetails should include data not gathered by Stripe Elements. For
 * example, `name` (string), `address` (object with `country` [string] and
 * `postal_code` [string]).
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
 * @return {object} stripeJs
 */
export function useStripeJs( stripeConfiguration ) {
	const [ stripeJs, setStripeJs ] = useState( null );
	useEffect( () => {
		if ( ! stripeConfiguration ) {
			return;
		}
		if ( window.Stripe ) {
			debug( 'stripe.js already loaded' );
			setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
			return;
		}
		debug( 'loading stripe.js...' );
		loadScript( stripeConfiguration.js_url, function( error ) {
			if ( error ) {
				debug( 'stripe.js script ' + error.src + ' failed to load.' );
				return;
			}
			debug( 'stripe.js loaded!' );
			setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
		} );
	}, [ stripeConfiguration ] );
	return stripeJs;
}

/**
 * React custom Hook for loading the Stripe Configuration
 *
 * @param {string} country (optional) The country code
 * @return {object} Stripe Configuration as returned by the stripe configuration endpoint
 */
export function useStripeConfiguration( country ) {
	const [ stripeConfiguration, setStripeConfiguration ] = useState();
	useEffect( () => {
		getStripeConfiguration( { country } ).then( configuration =>
			setStripeConfiguration( configuration )
		);
	}, [ country ] );
	return stripeConfiguration;
}
