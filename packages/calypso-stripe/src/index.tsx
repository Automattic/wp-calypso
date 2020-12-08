/**
 * External dependencies
 */
import debugFactory from 'debug';
import React, { useEffect, useCallback, useState, useContext, createContext } from 'react';
import { loadScript } from '@automattic/load-script';
// We are several versions old for react-stripe-elements, and probably should
// actually upgrade to the new Stripe.js anyway. Trying to use the actual types
// for this package causes all sorts of errors because, I think, they assume
// we're using the newer version of Stripe.js. However, all of this code
// currently works and we're just moving it around, so I'm disabling the
// linting and compiler errors for now.
// eslint-disable-next-line
// @ts-ignore
import { injectStripe, StripeProvider, Elements } from 'react-stripe-elements';

const debug = debugFactory( 'calypso-stripe' );

declare global {
	interface Window {
		Stripe: StripeFactory;
	}
}

type StripeFactory = ( key: string, options?: Record< string, string > ) => Stripe;

type PaymentDetails = Record< string, string >;

type HandleCardSetupResponse = { setupIntent: StripeSetupIntent; error: StripeError };

interface PaymentRequestOptionsItem {
	label: string;
	amount: number;
}

interface PaymentRequestOptions {
	requestPayerName: boolean;
	requestPayerPhone: boolean;
	requestPayerEmail: boolean;
	requestShipping: boolean;
	country: string;
	currency: string;
	displayItems: PaymentRequestOptionsItem[];
	total: PaymentRequestOptionsItem;
}

interface StripePaymentRequestResponse {
	canMakePayment: () => Promise< undefined | { applePay: boolean } >;
}

export type Stripe = {
	handleCardSetup: (
		setup_intent_id: string | undefined | null,
		{ payment_method_data }: { payment_method_data: { billing_details: PaymentDetails } }
	) => Promise< HandleCardSetupResponse >;
	createPaymentMethod: (
		type: string,
		{ billing_details }: { billing_details: PaymentDetails }
	) => Promise< { paymentMethod: { id: string }; error: StripeError } >;
	handleCardPayment: (
		secret: string,
		options: Record< string, string >
	) => Promise< { paymentIntent: StripeAuthenticationResponse; error: StripeError } >;
	paymentRequest: ( paymentRequestOptions: PaymentRequestOptions ) => StripePaymentRequestResponse;
};

export interface StripeConfiguration {
	js_url: string;
	public_key: string;
	processor_id: string;
	setup_intent_id: null | string;
}

export type ReloadStripeConfiguration = () => void;

export interface StripeData {
	stripe: null | Stripe;
	stripeConfiguration: null | StripeConfiguration;
	isStripeLoading: boolean;
	stripeLoadingError: undefined | null | Error;
	reloadStripeConfiguration: ReloadStripeConfiguration;
}

export type StripeSetupIntent = { payment_method: string };

export type StripeAuthenticationResponse = { status?: string };

const StripeContext = createContext< StripeData | undefined >( undefined );

type StripeError = Error & { code?: string; type?: string };

export interface TransactionResponseWithPaymentIntent {
	message: { payment_intent_client_secret: string };
}

type TransactionResponse = unknown;

export interface UseStripeJs {
	stripeJs: Stripe | null;
	isStripeLoading: boolean;
	stripeLoadingError: null | undefined | string;
}

export type GetStripeConfigurationArgs = { country?: string; needs_intent?: boolean };
export type GetStripeConfiguration = (
	requestArgs: GetStripeConfigurationArgs
) => Promise< StripeConfiguration >;

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
 * @param {object} paymentDetails The `billing_details` field of the `createPaymentMethod()` request
 * @returns {Promise} Promise that will be resolved or rejected
 */
export async function createStripePaymentMethod(
	stripe: Stripe,
	paymentDetails: PaymentDetails
): Promise< { id: string } > {
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

export async function createStripeSetupIntent(
	stripe: Stripe,
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
	let stripeResponse: HandleCardSetupResponse | undefined;
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
	debug( 'setup intent creation complete', stripeResponse );
	if ( stripeResponse?.error || ! stripeResponse?.setupIntent ) {
		// Note that this is a promise rejection
		if ( stripeResponse?.error?.type === 'validation_error' ) {
			throw new StripeValidationError(
				stripeResponse.error.code,
				getValidationErrorsFromStripeError( stripeResponse.error ) || {}
			);
		}
		throw new StripeSetupIntentError( stripeResponse?.error );
	}
	return stripeResponse.setupIntent;
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
export async function confirmStripePaymentIntent(
	stripeConfiguration: StripeConfiguration,
	paymentIntentClientSecret: string
): Promise< StripeAuthenticationResponse > {
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
 * @param {Error|undefined} [stripeConfigurationError] Any error that occured trying to load the configuration
 * @param {string} [locale] The locale, like 'en-us'. Stripe will auto-detect if not set.
 * @returns {object} { stripeJs, isStripeLoading }
 */
function useStripeJs(
	stripeConfiguration: StripeConfiguration | undefined,
	stripeConfigurationError: undefined | Error,
	locale: string | undefined = undefined
): UseStripeJs {
	const [ stripeJs, setStripeJs ] = useState< null | Stripe >( null );
	const [ isStripeLoading, setStripeLoading ] = useState< boolean >( true );
	const [ stripeLoadingError, setStripeLoadingError ] = useState< string | undefined >();
	const stripeLocale = getStripeLocaleForLocale( locale );
	useEffect( () => {
		let isSubscribed = true;

		async function initStripeAfterLoad( stripeConfiguration: StripeConfiguration ) {
			if ( ! window.Stripe ) {
				throw new Error( 'Failed to load Stripe' );
			}
			setStripeLoading( false );
			setStripeLoadingError( undefined );
			setStripeJs( window.Stripe( stripeConfiguration.public_key, { locale: stripeLocale } ) );
		}

		async function loadAndInitStripe() {
			if ( stripeConfigurationError ) {
				throw stripeConfigurationError;
			}
			if ( ! stripeConfiguration ) {
				return;
			}
			if ( window.Stripe ) {
				debug( 'stripe.js already loaded' );
				setStripeLoading( false );
				if ( ! stripeJs ) {
					setStripeLoadingError( undefined );
					setStripeJs( window.Stripe( stripeConfiguration.public_key, { locale: stripeLocale } ) );
				}
				return;
			}
			debug( 'loading stripe.js...' );
			// This should add window.Stripe
			await loadScript( stripeConfiguration.js_url );
			debug( 'stripe.js loaded!' );
			if ( isSubscribed ) {
				return initStripeAfterLoad( stripeConfiguration );
			}
		}

		loadAndInitStripe().catch( ( error ) => {
			debug( 'error while loading stripeJs', error );
			isSubscribed && setStripeLoading( false );
			isSubscribed && setStripeLoadingError( error );
		} );

		return () => {
			isSubscribed = false;
		};
	}, [ stripeConfigurationError, stripeConfiguration, stripeJs, stripeLocale ] );
	return { stripeJs, isStripeLoading, stripeLoadingError };
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
	stripeConfiguration: StripeConfiguration | undefined;
	stripeConfigurationError: undefined | Error;
	reloadStripeConfiguration: ReloadStripeConfiguration;
} {
	const [ stripeReloadCount, setReloadCount ] = useState< number >( 0 );
	const [ stripeConfigurationError, setStripeConfigurationError ] = useState< undefined | Error >();
	const [ stripeConfiguration, setStripeConfiguration ] = useState<
		undefined | StripeConfiguration
	>();
	const reloadStripeConfiguration = useCallback(
		() => setReloadCount( ( count ) => count + 1 ),
		[]
	);

	useEffect( () => {
		debug( 'loading stripe configuration' );
		let isSubscribed = true;
		fetchStripeConfiguration( requestArgs || {} )
			.then( ( configuration ) => {
				if ( ! isSubscribed ) {
					return;
				}
				if ( requestArgs?.needs_intent && ! configuration.setup_intent_id ) {
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
				setStripeConfiguration( configuration );
			} )
			.catch( ( error ) => {
				setStripeConfigurationError( error );
			} );
		return () => {
			isSubscribed = false;
		};
	}, [ requestArgs, stripeReloadCount, fetchStripeConfiguration ] );
	return { stripeConfiguration, stripeConfigurationError, reloadStripeConfiguration };
}

function StripeHookProviderInnerWrapper( {
	stripe,
	stripeData,
	children,
}: {
	stripe: Stripe;
	stripeData: StripeData;
	children: JSX.Element;
} ): JSX.Element {
	const updatedStripeData = { ...stripeData, stripe };
	return <StripeContext.Provider value={ updatedStripeData }>{ children }</StripeContext.Provider>;
}
const StripeInjectedWrapper = injectStripe( StripeHookProviderInnerWrapper );

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
	debug( 'rendering StripeHookProvider' );
	const {
		stripeConfiguration,
		stripeConfigurationError,
		reloadStripeConfiguration,
	} = useStripeConfiguration( fetchStripeConfiguration, configurationArgs );
	const { stripeJs, isStripeLoading, stripeLoadingError } = useStripeJs(
		stripeConfiguration,
		stripeConfigurationError,
		locale
	);

	const stripeData = {
		stripe: null, // This must be set inside the injected component
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
		reloadStripeConfiguration,
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
 * - reloadStripeConfiguration: a function that can be called with a value to force the stripe configuration to reload
 *
 * @returns {StripeData} See above
 */
export function useStripe(): StripeData {
	const stripeData = useContext( StripeContext );
	return (
		stripeData || {
			stripe: null,
			stripeConfiguration: null,
			isStripeLoading: false,
			stripeLoadingError: null,
			reloadStripeConfiguration: () => {
				// eslint-disable-next-line no-console
				console.error(
					`You cannot use reloadStripeConfiguration until stripe has been initialized.`
				);
			},
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

export async function showStripeModalAuth( {
	stripeConfiguration,
	response,
}: {
	stripeConfiguration: StripeConfiguration;
	response: TransactionResponseWithPaymentIntent;
} ): Promise< null | TransactionResponse > {
	const authenticationResponse = await confirmStripePaymentIntent(
		stripeConfiguration,
		response.message.payment_intent_client_secret
	);

	if ( authenticationResponse?.status ) {
		return authenticationResponse;
	}
	return null;
}
