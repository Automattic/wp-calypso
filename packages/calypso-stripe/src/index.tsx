import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import debugFactory from 'debug';
import { useRef, useEffect, useCallback, useState, useContext, createContext } from 'react';
import * as React from 'react';
import type {
	Stripe,
	StripeError,
	SetupIntent,
	StripeElementLocale,
	StripeCardNumberElement,
} from '@stripe/stripe-js';

const debug = debugFactory( 'calypso-stripe' );

type PaymentDetails = Record< string, unknown >;

interface PaymentRequestOptionsItem {
	label: string;
	amount: number;
}

export interface PaymentRequestOptions {
	requestPayerName: boolean;
	requestPayerPhone: boolean;
	requestPayerEmail: boolean;
	requestShipping: boolean;
	country: string;
	currency: string;
	displayItems: PaymentRequestOptionsItem[];
	total: PaymentRequestOptionsItem;
}

export interface StripeConfiguration {
	js_url: string;
	public_key: string;
	processor_id: string;
	setup_intent_id: null | string;
}

export type ReloadStripeConfiguration = () => void;

export type StripeLoadingError = undefined | null | Error;

export interface StripeData {
	stripe: null | Stripe;
	stripeConfiguration: null | StripeConfiguration;
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	reloadStripeConfiguration: ReloadStripeConfiguration;
}

export type StripeSetupIntent = SetupIntent;

export type StripeAuthenticationResponse = { status?: string; redirect_url?: string };

const StripeContext = createContext< StripeData | undefined >( undefined );

export interface UseStripeJs {
	stripe: Stripe | null;
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
}

export type GetStripeConfigurationArgs = { country?: string; needs_intent?: boolean };
export type GetStripeConfiguration = (
	requestArgs: GetStripeConfigurationArgs
) => Promise< StripeConfiguration >;

export type StripePaymentRequestHandler = ( event: StripePaymentRequestHandlerEvent ) => void;

export interface StripePaymentRequestHandlerEvent {
	token?: {
		id: string;
		object: 'token';
	};
	paymentMethod?: {
		id: string;
		object: 'payment_method';
	};
	complete: () => void;
}

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
export class StripeValidationError extends Error {
	code: string | undefined;
	messagesByField: Record< string, string[] >;

	constructor( code: string | undefined, messagesByField: Record< string, string[] > ) {
		let firstMessage = code;
		if ( Object.keys( messagesByField ).length > 0 ) {
			const firstKey = Object.keys( messagesByField )[ 0 ];
			const firstMessages = messagesByField[ firstKey ];
			if ( firstMessages.length > 0 ) {
				firstMessage = firstMessages[ 0 ];
			}
		}
		super( firstMessage );
		this.message = firstMessage || 'Unknown error';
		this.code = code;
		this.messagesByField = messagesByField;
	}
}

export class StripeConfigurationError extends Error {}

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
export class StripeSetupIntentError extends Error {
	stripeError: Error;

	constructor( stripeError: Error ) {
		super( stripeError.message );
		this.stripeError = stripeError;
		this.message = stripeError.message;
	}
}

/**
 * An error related to a Stripe PaymentMethod
 *
 * The object will include the original stripe error in the stripeError prop.
 *
 * @param {object} stripeError - The original Stripe error object
 */
export class StripePaymentMethodError extends Error {
	stripeError: Error;

	constructor( stripeError: Error ) {
		super( stripeError.message );
		this.stripeError = stripeError;
		this.message = stripeError.message;
	}
}

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
 * @param {object} element The StripeCardNumberElement
 * @param {object} paymentDetails The `billing_details` field of the `createPaymentMethod()` request
 * @returns {Promise} Promise that will be resolved or rejected
 */
export async function createStripePaymentMethod(
	stripe: Stripe,
	element: StripeCardNumberElement,
	paymentDetails: PaymentDetails
): Promise< { id: string } > {
	debug( 'creating payment method...', paymentDetails );
	const { paymentMethod, error } = await stripe.createPaymentMethod( {
		type: 'card',
		card: element,
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
	if ( ! paymentMethod ) {
		// Note that this is a promise rejection
		throw new Error( 'Unknown error while creating Stripe payment method' );
	}
	return paymentMethod;
}

export async function createStripeSetupIntent(
	stripe: Stripe,
	element: StripeCardNumberElement,
	stripeConfiguration: StripeConfiguration,
	paymentDetails: PaymentDetails
): Promise< StripeSetupIntent > {
	debug( 'creating setup intent...', paymentDetails );
	if ( ! stripeConfiguration.setup_intent_id ) {
		debug( 'Unable to create setup intent; missing intent ID' );
		throw new StripeConfigurationError(
			'There is a problem with the payment method system configuration.'
		);
	}
	let stripeResponse;
	try {
		stripeResponse = await stripe.confirmCardSetup( stripeConfiguration.setup_intent_id, {
			payment_method: {
				card: element,
				billing_details: paymentDetails,
			},
		} );
	} catch ( error ) {
		// Some errors are thrown by confirmCardSetup and not returned as an error
		throw new StripeSetupIntentError( error as Error );
	}
	debug( 'setup intent creation complete', stripeResponse );
	if ( stripeResponse?.error || ! stripeResponse?.setupIntent ) {
		// Note that this is a promise rejection
		if ( stripeResponse?.error?.type === 'validation_error' ) {
			throw new StripeValidationError(
				stripeResponse.error.code,
				getValidationErrorsFromStripeError( stripeResponse.error ) || {}
			);
		}
		throw new StripeSetupIntentError(
			new Error(
				stripeResponse?.error?.message ?? 'Unknown error while submitting Stripe setup intent'
			)
		);
	}
	return stripeResponse.setupIntent;
}

// Confirm any PaymentIntent from Stripe response and carry out 3DS or
// other next_actions if they are required.
export async function confirmStripePaymentIntent(
	stripe: Stripe,
	paymentIntentClientSecret: string
): Promise< StripeAuthenticationResponse > {
	debug( 'Confirming paymentIntent...', paymentIntentClientSecret );
	const { paymentIntent, error } = await stripe.confirmCardPayment( paymentIntentClientSecret );
	if ( error || ! paymentIntent ) {
		debug( 'Confirming paymentIntent failed', error );
		// Note that this is a promise rejection
		throw new StripePaymentMethodError(
			new Error( error?.message ?? 'Unknown error while confirming Stripe payment intent' )
		);
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
function getValidationErrorsFromStripeError(
	error: StripeError
): null | Record< string, string[] > {
	if ( error.type !== 'validation_error' || ! error.code ) {
		return null;
	}
	switch ( error.code ) {
		case 'incomplete_number':
		case 'invalid_number':
			return {
				card_number: [ error.message ?? error.code ],
			};
		case 'incomplete_cvc':
		case 'invalid_cvc':
			return {
				card_cvc: [ error.message ?? error.code ],
			};
		case 'incomplete_expiry':
		case 'invalid_expiry':
			return {
				card_expiry: [ error.message ?? error.code ],
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
 * @param {Error|undefined} [stripeConfigurationError] Any error that occured trying to load the configuration
 * @param {string} [locale] The locale, like 'en-us'. Stripe will auto-detect if not set.
 * @returns {UseStripeJs} The Stripe data
 */
function useStripeJs(
	stripeConfiguration: StripeConfiguration | null,
	stripeConfigurationError: undefined | Error,
	locale: string | undefined = undefined
): UseStripeJs {
	const [ state, setState ] = useState< UseStripeJs >( {
		stripe: null,
		isStripeLoading: true,
		stripeLoadingError: undefined,
	} );
	const stripeLocale = getStripeLocaleForLocale( locale );
	useEffect( () => {
		let isSubscribed = true;

		async function loadAndInitStripe() {
			if ( stripeConfigurationError ) {
				throw stripeConfigurationError;
			}
			if ( ! stripeConfiguration ) {
				return;
			}
			debug( 'loading stripe...' );
			const stripe = await loadStripe( stripeConfiguration.public_key, {
				locale: stripeLocale as StripeElementLocale,
			} );
			debug( 'stripe loaded!' );
			if ( isSubscribed ) {
				setState( {
					stripe,
					isStripeLoading: false,
					stripeLoadingError: undefined,
				} );
			}
		}

		loadAndInitStripe().catch( ( error ) => {
			debug( 'error while loading stripe', error );
			if ( isSubscribed ) {
				setState( {
					stripe: null,
					isStripeLoading: false,
					stripeLoadingError: error,
				} );
			}
		} );

		return () => {
			isSubscribed = false;
		};
	}, [ stripeConfigurationError, stripeConfiguration, stripeLocale ] );
	return state;
}

/**
 * React custom Hook for loading the Stripe Configuration
 *
 * This is internal. You probably actually want the useStripe hook.
 *
 * Returns an object with two properties: `stripeConfiguration`, and
 * `reloadStripeConfiguration`.
 *
 * `stripeConfiguration` is an object as returned by the stripe configuration
 * endpoint, possibly including a Setup Intent if one was requested (via
 * `needs_intent`).
 *
 * If there is a stripe error, it may be necessary to reload the configuration
 * since (for example) a Setup Intent may need to be recreated. You can force
 * the configuration to reload by calling `reloadStripeConfiguration()`.
 *
 * @param {Function} fetchStripeConfiguration A function that will fetch the stripe configuration from the HTTP API
 * @param {object} [requestArgs] (optional) Can include `country` or `needs_intent`
 * @returns {object} See above
 */
function useStripeConfiguration(
	fetchStripeConfiguration: GetStripeConfiguration,
	requestArgs?: undefined | null | GetStripeConfigurationArgs
): {
	stripeConfiguration: StripeConfiguration | null;
	stripeConfigurationError: undefined | Error;
	reloadStripeConfiguration: ReloadStripeConfiguration;
} {
	const [ stripeReloadCount, setReloadCount ] = useState< number >( 0 );
	const [ stripeConfigurationError, setStripeConfigurationError ] = useState< undefined | Error >();
	const [ stripeConfiguration, setStripeConfiguration ] = useState< null | StripeConfiguration >(
		null
	);
	const reloadStripeConfiguration = useCallback(
		() => setReloadCount( ( count ) => count + 1 ),
		[]
	);
	const memoizedRequestArgs = useMemoCompare( requestArgs, areRequestArgsEqual );

	useEffect( () => {
		debug( 'loading stripe configuration' );
		let isSubscribed = true;
		fetchStripeConfiguration( memoizedRequestArgs || {} )
			.then( ( configuration ) => {
				if ( ! isSubscribed ) {
					return;
				}
				if ( memoizedRequestArgs?.needs_intent && ! configuration.setup_intent_id ) {
					debug( 'invalid stripe configuration; missing setup_intent_id', configuration );
					throw new StripeConfigurationError(
						'Error loading new payment method configuration. Received invalid data from the server.'
					);
				}
				if (
					! configuration.js_url ||
					! configuration.public_key ||
					! configuration.processor_id
				) {
					debug( 'invalid stripe configuration; missing some data', configuration );
					throw new StripeConfigurationError(
						'Error loading payment method configuration. Received invalid data from the server.'
					);
				}
				debug( 'stripe configuration received', configuration );
				setStripeConfiguration( configuration ?? null );
			} )
			.catch( ( error ) => {
				setStripeConfigurationError( error );
			} );
		return () => {
			isSubscribed = false;
		};
	}, [ memoizedRequestArgs, stripeReloadCount, fetchStripeConfiguration ] );
	return { stripeConfiguration, stripeConfigurationError, reloadStripeConfiguration };
}

function areRequestArgsEqual(
	previous: undefined | null | GetStripeConfigurationArgs,
	next: undefined | null | GetStripeConfigurationArgs
): boolean {
	if ( next?.country !== previous?.country ) {
		return false;
	}
	if ( next?.needs_intent !== previous?.needs_intent ) {
		return false;
	}
	return true;
}

function StripeHookProviderInnerWrapper( {
	stripeData,
	children,
}: {
	stripeData: StripeData;
	children: JSX.Element;
} ): JSX.Element {
	return <StripeContext.Provider value={ stripeData }>{ children }</StripeContext.Provider>;
}

export function StripeHookProvider( {
	children,
	fetchStripeConfiguration,
	configurationArgs = null,
	locale = undefined,
}: {
	children: JSX.Element;
	fetchStripeConfiguration: GetStripeConfiguration;
	configurationArgs?: undefined | null | GetStripeConfigurationArgs;
	locale?: undefined | string;
} ): JSX.Element {
	const {
		stripeConfiguration,
		stripeConfigurationError,
		reloadStripeConfiguration,
	} = useStripeConfiguration( fetchStripeConfiguration, configurationArgs );
	const { stripe, isStripeLoading, stripeLoadingError } = useStripeJs(
		stripeConfiguration,
		stripeConfigurationError,
		locale
	);

	const stripeData = {
		stripe,
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
		reloadStripeConfiguration,
	};

	return (
		<Elements stripe={ stripe }>
			<StripeHookProviderInnerWrapper stripeData={ stripeData }>
				{ children }
			</StripeHookProviderInnerWrapper>
		</Elements>
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
 * - reloadStripeConfiguration: a function that can be called with a value to force the stripe configuration to reload
 *
 * @returns {StripeData} See above
 */
export function useStripe(): StripeData {
	const stripeData = useContext( StripeContext );
	if ( ! stripeData ) {
		throw new Error( 'useStripe can only be used inside a StripeHookProvider' );
	}
	return stripeData;
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
export function withStripeProps< P >( WrappedComponent: React.ComponentType< P > ): React.FC< P > {
	return ( props: P ): JSX.Element => {
		const stripeData = useStripe();
		const newProps = { ...props, ...stripeData };
		return <WrappedComponent { ...newProps } />;
	};
}

/**
 * Transforms a locale like en-us to a Stripe supported locale
 *
 * See https://stripe.com/docs/js/appendix/supported_locales
 *
 * @param {string} locale A locale string like 'en-us'
 * @returns {string} A stripe-supported locale string like 'en'
 */
function getStripeLocaleForLocale( locale: string | null | undefined ): string {
	const stripeSupportedLocales = [
		'ar',
		'bg',
		'cs',
		'da',
		'de',
		'el',
		'et',
		'en',
		'es',
		'fi',
		'fr',
		'he',
		'id',
		'it',
		'ja',
		'lt',
		'lv',
		'ms',
		'nb',
		'nl',
		'pl',
		'pt',
		'ru',
		'sk',
		'sl',
		'sv',
		'zh',
	];
	if ( ! locale ) {
		return 'auto';
	}
	if ( locale.toLowerCase() === 'pt-br' ) {
		return 'pt-BR';
	}
	const stripeLocale = locale.toLowerCase().substring( 0, 2 );
	if ( ! stripeSupportedLocales.includes( stripeLocale ) ) {
		return 'auto';
	}
	return stripeLocale;
}

// See https://usehooks.com/useMemoCompare/
function useMemoCompare< A, B >(
	next: B,
	compare: ( previous: A | B | undefined, next: B ) => boolean
): A | B | undefined {
	// Ref for storing previous value
	const previousRef = useRef< undefined | A | B >();
	const previous = previousRef.current;

	// Pass previous and next value to compare function
	// to determine whether to consider them equal.
	const isEqual = compare( previous, next );

	// If not equal update previousRef to next value.
	// We only update if not equal so that this hook continues to return
	// the same old value if compare keeps returning true.
	useEffect( () => {
		if ( ! isEqual ) {
			previousRef.current = next;
		}
	} );

	// Finally, if equal then return the previous value
	return isEqual ? previous : next;
}
