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
 * Use getQueryParam to check if a query string parameter exists and return its value
 * @param param - the query string parameter to check
 * @returns - string | null
 */

export function getQueryParam( param: string ) {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	return new URLSearchParams( window.location.search ).get( param );
}
