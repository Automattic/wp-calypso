import debugFactory from 'debug';
import { useRef, useEffect, useState, useContext, createContext, PropsWithChildren } from 'react';

const debug = debugFactory( 'calypso-razorpay' );

export interface RazorpayConfiguration {
	js_url: string;
	options: RazorpayOptions;
}

export interface RazorpayOptions {
	key: string;
	order_id?: string; // This is a razorpay order ID; the name is constrained by a 3rd party library.
	customer_id?: string; // This is a razorpay customer ID; the name is constrained by a 3rd party library.
	handler?: ( response: RazorpayModalResponse ) => void;
	prefill?: {
		contact?: string;
		email?: string;
	};
	modal?: {
		ondismiss?: ( response: RazorpayModalResponse ) => void;
	};
	recurring?: string;
}

export interface RazorpayModalResponse {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}

export interface RazorpayConfirmationRequestArgs {
	razorpay_payment_id: string;
	razorpay_signature: string;
	bd_order_id: string;
}

export declare class Razorpay {
	constructor( options: RazorpayConfiguration[ 'options' ] );
	open: () => unknown;
}

declare global {
	interface Window {
		Razorpay?: typeof Razorpay;
	}
}

export type RazorpayLoadingError = Error | null | undefined;

export interface RazorpayData {
	razorpayConfiguration: RazorpayConfiguration | null;
	isRazorpayLoading: boolean;
	razorpayLoadingError: RazorpayLoadingError;
}

const RazorpayContext = createContext< RazorpayData | undefined >( undefined );

export interface UseRazorpayJs {
	isRazorpayLoading: boolean;
	razorpayLoadingError: RazorpayLoadingError;
}

export type GetRazorpayConfigurationArgs = { sandbox: boolean };
export type GetRazorpayConfiguration = (
	requestArgs: GetRazorpayConfigurationArgs
) => Promise< RazorpayConfiguration >;

export class RazorpayConfigurationError extends Error {}

/**
 * React custom Hook for loading razorpayJs
 *
 * This is internal. You probably actually want the useRazorpay hook.
 *
 * Its parameter is the value returned by useRazorpayConfiguration
 * @param {RazorpayConfiguration} razorpayConfiguration Object holding Razorpay configuration options
 * @param {Error|undefined} [razorpayConfigurationError] Any error that occured trying to load the configuration
 * @returns {UseRazorpayJs} The Razorpay data
 */
function useRazorpayJs(
	razorpayConfiguration: RazorpayConfiguration | null,
	razorpayConfigurationError: Error | undefined
): UseRazorpayJs {
	const [ state, setState ] = useState< UseRazorpayJs >( {
		isRazorpayLoading: true,
		razorpayLoadingError: undefined,
	} );
	useEffect( () => {
		let isSubscribed = true;
		async function loadAndInitRazorpay() {
			if ( razorpayConfigurationError ) {
				throw razorpayConfigurationError;
			}
			if ( ! razorpayConfiguration ) {
				debug( 'Skip loading Razorpay; configuration not available' );
				return;
			}
			if ( ! razorpayConfiguration.js_url ) {
				throw new RazorpayConfigurationError( 'Razorpay library URL not specified.' );
			}

			const script = document.createElement( 'script' );
			script.src = razorpayConfiguration.js_url;
			script.async = true;
			script.onload = () => {
				debug( 'Razorpay JS library loaded!' );

				if ( typeof window === 'undefined' || ! window.Razorpay ) {
					throw new RazorpayConfigurationError(
						'Razorpay loading error: Razorpay object not defined'
					);
				}

				if ( isSubscribed ) {
					setState( {
						isRazorpayLoading: false,
						razorpayLoadingError: undefined,
					} );
				}
			};
			document.body.appendChild( script );
		}

		loadAndInitRazorpay().catch( ( error ) => {
			debug( 'Error while loading Razorpay!' );
			if ( isSubscribed ) {
				setState( {
					isRazorpayLoading: false,
					razorpayLoadingError: error,
				} );
			}
		} );

		return () => {
			isSubscribed = false;
		};
	}, [ razorpayConfigurationError, razorpayConfiguration ] );
	return state;
}

/**
 * React custom Hook for loading the Razorpay Configuration
 *
 * This is internal. You probably actually want the useRazorpay hook.
 */
function useRazorpayConfiguration(
	fetchRazorpayConfiguration: GetRazorpayConfiguration,
	requestArgs?: GetRazorpayConfigurationArgs | null | undefined
): {
	razorpayConfiguration: RazorpayConfiguration | null;
	razorpayConfigurationError: Error | undefined;
} {
	const [ razorpayConfigurationError, setRazorpayConfigurationError ] = useState<
		Error | undefined
	>();
	const [ razorpayConfiguration, setRazorpayConfiguration ] =
		useState< RazorpayConfiguration | null >( null );
	const memoizedRequestArgs = useMemoCompare( requestArgs, areRequestArgsEqual );

	useEffect( () => {
		debug( 'Loading razorpay configuration' );
		let isSubscribed = true;
		fetchRazorpayConfiguration( memoizedRequestArgs || { sandbox: true } )
			.then( ( configuration ) => {
				if ( ! isSubscribed ) {
					return;
				}
				if ( ! configuration.js_url ) {
					debug( 'Invalid razorpay configuration; js_url missing', configuration );
					throw new RazorpayConfigurationError(
						'Error loading payment method configuration. Received invalid data from the server.'
					);
				}
				debug( 'Razorpay configuration received', configuration );
				setRazorpayConfiguration( configuration ?? null );
			} )
			.catch( ( error ) => {
				setRazorpayConfigurationError( error );
			} );
		return () => {
			isSubscribed = false;
		};
	}, [ memoizedRequestArgs, fetchRazorpayConfiguration ] );
	return { razorpayConfiguration, razorpayConfigurationError };
}

function areRequestArgsEqual(
	previous: GetRazorpayConfigurationArgs | null | undefined,
	next: GetRazorpayConfigurationArgs | null | undefined
): boolean {
	if ( ! previous && ! next ) {
		// Catch if both are either null or undefined; don't need to distinguish these
		return true;
	}
	if ( ! previous || ! next ) {
		// Catch if one is an object and the other is not
		return false;
	}
	return previous.sandbox === next.sandbox;
}

export function RazorpayHookProvider( {
	children,
	fetchRazorpayConfiguration,
}: PropsWithChildren< {
	fetchRazorpayConfiguration: GetRazorpayConfiguration;
} > ) {
	const configurationArgs = {
		sandbox: true,
	};

	const { razorpayConfiguration, razorpayConfigurationError } = useRazorpayConfiguration(
		fetchRazorpayConfiguration,
		configurationArgs
	);

	const { isRazorpayLoading, razorpayLoadingError } = useRazorpayJs(
		razorpayConfiguration,
		razorpayConfigurationError
	);

	const razorpayData = {
		razorpayConfiguration,
		isRazorpayLoading,
		razorpayLoadingError,
	};

	return <RazorpayContext.Provider value={ razorpayData }>{ children }</RazorpayContext.Provider>;
}

/**
 * Custom hook to access Razorpay.js
 *
 * First you must wrap a parent component in `RazorpayHookProvider`. Then you can
 * call this hook in any sub-component to get access to the razorpay variables
 * and functions.
 *
 * This returns an object with the following properties:
 *
 * - razorpayConfiguration: the object containing the data returned by the wpcom razorpay configuration endpoint
 * - isRazorpayLoading: a boolean that is true if razorpay is currently being loaded
 * - razorpayLoadingError: an optional object that will be set if there is an error loading razorpay
 * @returns {RazorpayData} See above
 */
export function useRazorpay(): RazorpayData {
	const razorpayData = useContext( RazorpayContext );
	if ( ! razorpayData ) {
		throw new Error( 'useRazorpay can only be used inside a RazorpayHookProvider' );
	}
	return razorpayData;
}

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
