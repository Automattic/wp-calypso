import config from '@automattic/calypso-config';

/**
 * This function can be used to query the checkoutVersion parameter from the URL. Useful for A/B testing.
 * @param {string} version
 * @returns {boolean}
 */

export function hasCheckoutVersion( version: string ) {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	const isCheckoutVersioned = config.isEnabled( 'checkout/checkout-version' );
	const urlParams = new URLSearchParams( window.location.search );

	const checkoutVersion = urlParams.get( 'checkoutVersion' );
	if ( isCheckoutVersioned && checkoutVersion === version ) {
		return true;
	}
	return false;
}

/**
 * Use hasFeatureFlagEnabled to check if a feature flag is enabled.
 * @param flag - the environment config flag to check for
 * @returns Boolean
 */

export function hasFeatureFlagEnabled( flag: string ) {
	const featureFlag = config.isEnabled( flag );
	if ( featureFlag ) {
		return true;
	}
	return false;
}

/**
 * Use hasQueryStringParameter to check if a query string parameter exists and has a specific value.
 * @param param - the query string parameter to check
 * @param value - the value to check for
 * @returns - Boolean
 * @example - hasQueryStringParameter( 'checkoutVersion', 'v2' )
 */

export function hasQueryStringParameter( param: string, value: string ) {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	const urlParams = new URLSearchParams( window.location.search );
	const paramValue = urlParams.get( param );
	if ( paramValue === value ) {
		return true;
	}
	return false;
}
