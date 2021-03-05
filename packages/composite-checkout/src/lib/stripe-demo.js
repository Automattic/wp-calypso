/**
 * External dependencies
 */
import React, { useEffect, useReducer, useState, useContext, createContext } from 'react';
import { injectStripe, StripeProvider, Elements } from 'react-stripe-elements';
import debugFactory from 'debug';

const debug = debugFactory( 'composite-checkout:lib-stripe' );
const StripeContext = createContext();

const initialStripeJsState = {
	stripeJs: null,
	isStripeLoading: true,
	stripeLoadingError: null,
};

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
 * - forceReload: a function that can be called to force the stripe configuration to reload
 *
 * @returns {object} See above
 */
export function useStripe() {
	const stripeData = useContext( StripeContext );
	if ( ! stripeData ) {
		throw new Error( 'useStripe can only be used in a StripeHookProvider' );
	}
	return stripeData;
}

function StripeHookProviderInnerWrapper( { stripe, stripeData, children } ) {
	const updatedStripeData = { ...stripeData, stripe };
	return <StripeContext.Provider value={ updatedStripeData }>{ children }</StripeContext.Provider>;
}
const StripeInjectedWrapper = injectStripe( StripeHookProviderInnerWrapper );

/**
 * Custom Provider to access Stripe.js
 *
 * First you must wrap a parent component in this Provider. Then you can call
 * `useStripe()` in any sub-component to get access to the stripe variables and
 * functions. See `useStripe` for more details.
 *
 * This has one optional prop, `configurationArgs`, which is an object that
 * will be used when fetching the stripe configuration.
 *
 * @returns {object} React element
 */
export function StripeHookProvider( { children, fetchStripeConfiguration } ) {
	const stripeConfiguration = useStripeConfiguration( fetchStripeConfiguration );
	const { stripeJs, isStripeLoading, stripeLoadingError } = useStripeJs( stripeConfiguration );

	const stripeData = {
		stripe: null, // This must be set inside the injected component
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
	};
	debug( 'StripeHookProvider', stripeData );

	return (
		<StripeProvider stripe={ stripeJs }>
			<Elements>
				<StripeInjectedWrapper stripeData={ stripeData }>{ children }</StripeInjectedWrapper>
			</Elements>
		</StripeProvider>
	);
}

/**
 * React custom Hook for loading the Stripe Configuration
 *
 * This is internal. You probably actually want the useStripe hook.
 *
 * Returns `stripeConfiguration`, an object as returned by the stripe
 * configuration endpoint.
 *
 * @param {Function} fetchStripeConfiguration Function that actually fetches the configuration
 * @returns {object} See above
 */
function useStripeConfiguration( fetchStripeConfiguration ) {
	const [ stripeConfiguration, setStripeConfiguration ] = useState();
	useEffect( () => {
		let isSubscribed = true;
		if ( ! stripeConfiguration ) {
			debug( 'loading stripe configuration' );
			fetchStripeConfiguration()
				.then( ( configuration ) => {
					debug( 'stripe configuration retrieved' );
					isSubscribed && setStripeConfiguration( configuration );
				} )
				.catch( ( error ) => {
					debug( 'stripe configuration fetch error', error );
				} );
		}
		return () => ( isSubscribed = false );
	}, [ stripeConfiguration, fetchStripeConfiguration ] );
	return stripeConfiguration;
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
	const [ state, dispatch ] = useReducer( stripeJsReducer, initialStripeJsState );
	const { stripeJs, isStripeLoading, stripeLoadingError } = state;
	const setStripeLoadingError = ( payload ) =>
		dispatch( { type: 'STRIPE_LOADING_ERROR', payload } );
	const setStripeJs = ( payload ) => dispatch( { type: 'STRIPE_JS_SET', payload } );

	useEffect( () => {
		let isSubscribed = true;

		async function loadAndInitStripe() {
			debug( 'loadAndInitStripe' );
			if ( window.Stripe ) {
				debug( 'loadAndInitStripe cancelled; stripe already exists' );
				isSubscribed && setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
				return;
			}
			debug( 'loadAndInitStripe loading...', stripeConfiguration.js_url );
			await loadScriptAsync( stripeConfiguration.js_url );
			debug( 'loadAndInitStripe success; stripe loaded' );
			isSubscribed && setStripeJs( window.Stripe( stripeConfiguration.public_key ) );
		}

		debug( 'useStripeJs loading' );
		if ( stripeConfiguration ) {
			loadAndInitStripe().catch( ( error ) => {
				debug( 'loadAndInitStripe error', error );
				isSubscribed && setStripeLoadingError( error );
			} );
		}

		return () => ( isSubscribed = false );
	}, [ stripeConfiguration ] );

	return { stripeJs, isStripeLoading, stripeLoadingError };
}

function stripeJsReducer( state, action ) {
	switch ( action.type ) {
		case 'STRIPE_LOADING_ERROR':
			return { ...state, isStripeLoading: false, stripeLoadingError: action.payload };
		case 'STRIPE_JS_SET':
			debug( 'setting stripejs' );
			return {
				...state,
				stripeJs: action.payload,
				isStripeLoading: false,
				stripeLoadingError: null,
			};
		default:
			return state;
	}
}
function loadScriptAsync( url ) {
	return new Promise( ( resolve, reject ) => {
		const scriptTag = document.createElement( 'script' );
		scriptTag.type = 'text/javascript';
		scriptTag.src = url;
		scriptTag.onload = resolve;
		scriptTag.onerror = reject;
		document.body.appendChild( scriptTag );
	} );
}
