export function hasCheckoutVersion( version: string ) {
	/**
	 * This function can be used to query the checkoutVersion parameter from the URL. Useful for A/B testing.
	 * @param {string} version
	 * @returns {boolean}
	 */

	if ( typeof window === 'undefined' ) {
		return false;
	}

	const urlParams = new URLSearchParams( window.location.search );
	const checkoutVersion = urlParams.get( 'checkoutVersion' );
	if ( checkoutVersion === version ) {
		return true;
	}
	return false;
}
