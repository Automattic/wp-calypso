/**
 * External dependencies
 */
import debugFactory from 'debug';
import React, { useEffect, useState, useContext, createContext } from 'react';
import { loadScript } from '@automattic/load-script';
import { injectStripe, StripeProvider, Elements } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import { getStripeConfiguration } from 'lib/store-transactions';

const debug = debugFactory( 'calypso:stripe' );

const StripeContext = createContext();

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
 * An error related to a Stripe PaymentMethod
 *
 * The object will include the original stripe error in the stripeError prop.
 *
 * @param {object} stripeError - The original Stripe error object
 */
function StripePaymentMethodError( stripeError ) {
	this.stripeError = stripeError;
	this.message = stripeError.message;
}
StripePaymentMethodError.prototype = new Error();
export { StripePaymentMethodError };

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
 * @returns {Promise} Promise that will be resolved or rejected
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
	let stripeResponse = {};
	try {
		stripeResponse = await stripe.handleCardSetup( stripeConfiguration.setup_intent_id, {
			payment_method_data: {
				billing_details: paymentDetails,
			},
		} );
	} catch ( error ) {
		// Some errors are thrown by handleCardSetup and not returned as an error
		throw new StripeSetupIntentError( error );
	}
	const { setupIntent, error } = stripeResponse;
	debug( 'setup intent creation complete', setupIntent, error );
	if ( error || ! setupIntent ) {
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
 * @returns {Promise} Promise that will be resolved or rejected
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
		debug( 'Confirming paymentIntent failed', error );
		// Note that this is a promise rejection
		throw new StripePaymentMethodError( error );
	}

	return paymentIntent;
}

/**
 * Extract validation errors from a Stripe error
 *
 * Returns null if validation errors cannot be found.
 *
 * @param {object} error An error returned by a Stripe function like createPaymentMethod
 * @returns {object | null} An object keyed by input field name whose values are arrays of error strings for that field
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
 * This is internal. You probably actually want the useStripe hook.
 *
 * Its parameter is the value returned by useStripeConfiguration
 *
 * @param {object} stripeConfiguration An object containing { public_key, js_url }
 * @returns {object} { stripeJs, isStripeLoading }
 */
function useStripeJs( stripeConfiguration ) {
	const [ stripeJs, setStripeJs ] = useState( null );
	const [ isStripeLoading, setStripeLoading ] = useState( true );
	const [ stripeLoadingError, setStripeLoadingError ] = useState();
	useEffect( () => {
		let isSubscribed = true;
		async function loadAndInitStripe() {
			if ( ! stripeConfiguration ) {
				return;
			}
			if ( window.Stripe ) {
				debug( 'stripe.js already loaded' );
				setStripeLoading( false );
				if ( ! stripeJs ) {
					setStripeLoadingError();
					setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
				}
				return;
			}
			debug( 'loading stripe.js...' );
			await loadScript( stripeConfiguration.js_url );
			debug( 'stripe.js loaded!' );
			isSubscribed && setStripeLoading( false );
			isSubscribed && setStripeLoadingError();
			isSubscribed && setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
		}

		loadAndInitStripe().catch( ( error ) => {
			debug( 'error while loading stripeJs', error );
			isSubscribed && setStripeLoading( false );
			isSubscribed && setStripeLoadingError( error );
		} );

		return () => ( isSubscribed = false );
	}, [ stripeConfiguration, stripeJs ] );
	return { stripeJs, isStripeLoading, stripeLoadingError };
}

/**
 * React custom Hook for loading the Stripe Configuration
 *
 * This is internal. You probably actually want the useStripe hook.
 *
 * Returns an object with two properties: `stripeConfiguration`, and
 * `setStripeError`.
 *
 * `stripeConfiguration` is an object as returned by the stripe configuration
 * endpoint, possibly including a Setup Intent if one was requested (via
 * `needs_intent`).
 *
 * If there is a stripe error, it may be necessary to reload the configuration
 * since (for example) a Setup Intent may need to be recreated. You can force
 * the configuration to reload by setting a value by calling `setStripeError()`
 * with a value for that error.
 *
 * @param {object} requestArgs (optional) Can include `country` or `needs_intent`
 * @param {Function} fetchStripeConfiguration (optional) If provided, will call instead of getStripeConfiguration
 * @returns {object} See above
 */
function useStripeConfiguration( requestArgs, fetchStripeConfiguration ) {
	const [ stripeError, setStripeError ] = useState();
	const [ stripeConfiguration, setStripeConfiguration ] = useState();
	useEffect( () => {
		const getConfig = fetchStripeConfiguration || getStripeConfiguration;
		debug( 'loading stripe configuration' );
		let isSubscribed = true;
		getConfig( requestArgs || {} ).then(
			( configuration ) => isSubscribed && setStripeConfiguration( configuration )
		);
		return () => ( isSubscribed = false );
	}, [ requestArgs, stripeError, fetchStripeConfiguration ] );
	return { stripeConfiguration, setStripeError };
}

function StripeHookProviderInnerWrapper( { stripe, stripeData, children } ) {
	const updatedStripeData = { ...stripeData, stripe };
	return <StripeContext.Provider value={ updatedStripeData }>{ children }</StripeContext.Provider>;
}
const StripeInjectedWrapper = injectStripe( StripeHookProviderInnerWrapper );

export function StripeHookProvider( { children, configurationArgs, fetchStripeConfiguration } ) {
	debug( 'rendering StripeHookProvider' );
	const { stripeConfiguration, setStripeError } = useStripeConfiguration(
		configurationArgs,
		fetchStripeConfiguration
	);
	const { stripeJs, isStripeLoading, stripeLoadingError } = useStripeJs( stripeConfiguration );

	const stripeData = {
		stripe: null, // This must be set inside the injected component
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
		setStripeError,
	};

	return (
		<StripeProvider stripe={ stripeJs }>
			<Elements>
				<StripeInjectedWrapper stripeData={ stripeData }>{ children }</StripeInjectedWrapper>
			</Elements>
		</StripeProvider>
	);
}

/**
 * Custom hook to access Stripe.js
 *
 * First you must wrap a parent component in `StripeHookProvider`. Then you can
 * call this hook in any sub-component to get access to the stripe variables
 * and functions.
 *
 * This returns an object with the following properties:
 *
 * - stripe: the instance of the stripe library
 * - stripeConfiguration: the object containing the data returned by the wpcom stripe configuration endpoint
 * - isStripeLoading: a boolean that is true if stripe is currently being loaded
 * - stripeLoadingError: an optional object that will be set if there is an error loading stripe
 * - setStripeError: a function that can be called with a value to force the stripe configuration to reload
 *
 * @returns {object} See above
 */
export function useStripe() {
	const stripeData = useContext( StripeContext );
	return (
		stripeData || {
			stripe: null,
			stripeConfiguration: null,
			isStripeLoading: false,
			stripeLoadingError: null,
			setStripeError: () => {},
		}
	);
}

/**
 * HOC for components that cannot use useStripe
 *
 * Adds several props to the wrapped component. See docs of useStripe for
 * details of the properties it provides.
 *
 * @param {object} WrappedComponent The component to wrap
 * @returns {object} WrappedComponent
 */
export function withStripeProps( WrappedComponent ) {
	return ( props ) => {
		const stripeData = useStripe();
		const newProps = { ...props, ...stripeData };
		return <WrappedComponent { ...newProps } />;
	};
}
