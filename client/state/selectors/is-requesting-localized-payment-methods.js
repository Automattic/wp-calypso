/**
 * Returns whether a browser IP geolocation request is in progress.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether request is in progress
 */
export function isRequestingLocalizedPaymentMethods( state ) {
	return state.i18n.requesting;
}
