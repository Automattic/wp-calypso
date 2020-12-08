/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */

export const persistSignupDestination = ( url ) => {
	const DAY_IN_SECONDS = 3600 * 24;
	const expirationDate = new Date( new Date().getTime() + DAY_IN_SECONDS * 1000 );
	const options = { path: '/', expires: expirationDate, sameSite: 'strict' };
	document.cookie = cookie.serialize( 'wpcom_signup_complete_destination', url, options );
};

export const retrieveSignupDestination = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.wpcom_signup_complete_destination;
};

export const clearSignupDestinationCookie = () => {
	// Set expiration to a random time in the past so that the cookie gets removed.
	const expirationDate = new Date( new Date().getTime() - 1000 );
	const options = { path: '/', expires: expirationDate };

	document.cookie = cookie.serialize( 'wpcom_signup_complete_destination', '', options );
};

export const getSignupCompleteSlug = () =>
	sessionStorage.getItem( 'wpcom_signup_complete_site_slug' ); // eslint-disable-line no-undef
export const setSignupCompleteSlug = ( value ) =>
	sessionStorage.setItem( 'wpcom_signup_complete_site_slug', value ); // eslint-disable-line no-undef
export const wasSignupCheckoutPageUnloaded = () =>
	sessionStorage.getItem( 'was_signup_checkout_page_unloaded' ); // eslint-disable-line no-undef
export const setSignupCheckoutPageUnloaded = ( value ) =>
	sessionStorage.setItem( 'was_signup_checkout_page_unloaded', value ); // eslint-disable-line no-undef
export const getSignupCompleteFlowName = () =>
	sessionStorage.getItem( 'wpcom_signup_complete_flow_name' ); // eslint-disable-line no-undef
export const setSignupCompleteFlowName = ( value ) =>
	sessionStorage.setItem( 'wpcom_signup_complete_flow_name', value ); // eslint-disable-line no-undef
