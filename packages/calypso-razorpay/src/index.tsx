import debugFactory from 'debug';
import { useRef, useEffect, useState, useContext, createContext, PropsWithChildren } from 'react';

const debug = debugFactory( 'calypso-razorpay' );

export interface RazorpayConfiguration {
	js_url: string;
	public_key: string;
	processor_id: string;
}

export type RazorpayLoadingError = undefined | null | Error;

export interface RazorpayData {
	razorpay: boolean | null; // TODO: see what razorpay.js provides that is analogous to Stripe
	razorpayConfiguration: null | RazorpayConfiguration;
	isRazorpayLoading: boolean;
	razorpayLoadingError: RazorpayLoadingError;
}

const RazorpayContext = createContext< RazorpayData | undefined >( undefined );

export interface UseRazorpayJs {
	razorpay: boolean | null;
	isRazorpayLoading: boolean;
	razorpayLoadingError: RazorpayLoadingError;
}

export type GetRazorpayConfigurationArgs = { sandbox: boolean }; // TODO: fix this dummy argument
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
 * @param {Object} razorpayConfiguration An object containing !!!TODO!!!
 * @param {Error|undefined} [razorpayConfigurationError] Any error that occured trying to load the configuration
 * @returns {UseRazorpayJs} The Razorpay data
 */
function useRazorpayJs(
	razorpayConfiguration: RazorpayConfiguration | null,
	razorpayConfigurationError: undefined | Error
): UseRazorpayJs {
	const [ state, setState ] = useState< UseRazorpayJs >( {
		razorpay: null,
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
				return;
			}
			debug( 'loading razorpay...' );
			const razorpay = await loadRazorpay( razorpayConfiguration );
			debug( 'razorpay loaded!' );
			if ( isSubscribed ) {
				setState( {
					razorpay,
					isRazorpayLoading: false,
					razorpayLoadingError: undefined,
				} );
			}
		}

		loadAndInitRazorpay().catch( ( error ) => {
			debug( 'error while loading razorpay', error );
			if ( isSubscribed ) {
				setState( {
					razorpay: null,
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
	requestArgs?: undefined | null | GetRazorpayConfigurationArgs
): {
	razorpayConfiguration: RazorpayConfiguration | null;
	razorpayConfigurationError: undefined | Error;
} {
	const [ razorpayConfigurationError, setRazorpayConfigurationError ] = useState<
		undefined | Error
	>();
	const [ razorpayConfiguration, setRazorpayConfiguration ] =
		useState< null | RazorpayConfiguration >( null );
	const memoizedRequestArgs = useMemoCompare( requestArgs, areRequestArgsEqual );

	useEffect( () => {
		debug( 'loading razorpay configuration' );
		let isSubscribed = true;
		fetchRazorpayConfiguration( memoizedRequestArgs || { sandbox: true } )
			.then( ( configuration ) => {
				if ( ! isSubscribed ) {
					return;
				}
				if (
					! configuration.js_url ||
					! configuration.public_key ||
					! configuration.processor_id
				) {
					debug( 'invalid razorpay configuration; missing some data', configuration );
					throw new RazorpayConfigurationError(
						'Error loading payment method configuration. Received invalid data from the server.'
					);
				}
				debug( 'razorpay configuration received', configuration );
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

// TODO
function areRequestArgsEqual(
	previous: undefined | null | GetRazorpayConfigurationArgs,
	next: undefined | null | GetRazorpayConfigurationArgs
): boolean {
	return !! previous && !! next; // TODO
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
	const { razorpay, isRazorpayLoading, razorpayLoadingError } = useRazorpayJs(
		razorpayConfiguration,
		razorpayConfigurationError
	);

	const razorpayData = {
		razorpay,
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
 * - razorpay: the instance of the razorpay library
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
