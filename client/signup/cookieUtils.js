/**
 * Exernal dependencies
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

export const persistSignupSiteCreated = ( siteSlug ) => {
	const DAY_IN_SECONDS = 3600 * 24;
	const expirationDate = new Date( new Date().getTime() + DAY_IN_SECONDS * 1000 );
	const options = { path: '/', expires: expirationDate, sameSite: 'strict' };
	document.cookie = cookie.serialize( 'wpcom_signup_complete_site_slug', siteSlug, options );
};

export const retrieveSignupDestination = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.wpcom_signup_complete_destination;
};

export const retrieveSignupSiteCreated = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.wpcom_signup_complete_site_slug;
};

export const clearSignupDestinationCookie = () => {
	// Set expiration to a random time in the past so that the cookie gets removed.
	const expirationDate = new Date( new Date().getTime() - 1000 );
	const options = { path: '/', expires: expirationDate };

	document.cookie = cookie.serialize( 'wpcom_signup_complete_destination', '', options );
};
