import cookie from 'cookie';
import { urlToSlug } from 'calypso/lib/url';
import { JETPACK_CONNECT_TTL_SECONDS } from 'calypso/state/jetpack-connect/constants';

export const SESSION_STORAGE_SELECTED_PLAN = 'jetpack_connect_selected_plan';
export const SESSION_STORAGE_SOURCE = 'jetpack_connect_source';
export const GOOGLE_PHOTOS_PICKER_SESSION = 'google_photos_picker_session';
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Utilities for storing jetpack connect state that needs to persist across
 * logins and redirects. Session Storage work well for this, since redux
 * state is not guaranteed to be persisted in these scenarios.
 * @param planSlug A plan/product unique identifier
 */
export const storePlan = ( planSlug ) => {
	window.sessionStorage.setItem( SESSION_STORAGE_SELECTED_PLAN, planSlug );
};

export const clearPlan = () => {
	window.sessionStorage.removeItem( SESSION_STORAGE_SELECTED_PLAN );
};

export const retrievePlan = () => {
	return window.sessionStorage.getItem( SESSION_STORAGE_SELECTED_PLAN );
};

export const persistSession = ( url ) => {
	const options = {
		maxAge: JETPACK_CONNECT_TTL_SECONDS,
		path: '/',
	};
	document.cookie = cookie.serialize( 'jetpack_connect_session_url', urlToSlug( url ), options );
};

export const isCalypsoStartedConnection = ( siteSlug ) => {
	const cookies = cookie.parse( document.cookie );
	return cookies.jetpack_connect_session_url === urlToSlug( siteSlug );
};

export const persistSsoApproved = ( siteId ) => {
	const options = {
		maxAge: 300,
		path: '/',
	};
	document.cookie = cookie.serialize( 'jetpack_sso_approved', siteId, options );
};

export const isSsoApproved = ( siteId ) => {
	const cookies = cookie.parse( document.cookie );
	return siteId === parseInt( cookies.jetpack_sso_approved, 10 );
};

export const persistMobileRedirect = ( url ) => {
	const options = { path: '/' };
	document.cookie = cookie.serialize( 'jetpack_connect_mobile_redirect', url, options );
};

export const retrieveMobileRedirect = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.jetpack_connect_mobile_redirect;
};

export const storeSource = ( source ) => {
	window.sessionStorage.setItem( SESSION_STORAGE_SOURCE, source );
};

export const clearSource = () => {
	window.sessionStorage.removeItem( SESSION_STORAGE_SOURCE );
};

export const retrieveSource = () => {
	return window.sessionStorage.getItem( SESSION_STORAGE_SOURCE );
};

export const persistGooglePhotosPickerSessionCookie = ( sessionId ) => {
	const options = {
		path: '/',
		expires: new Date( Date.now() + SEVEN_DAYS_MS ),
		domain: '.' + document.location.hostname.split( '.' ).slice( -2 ).join( '.' ),
	};

	document.cookie = cookie.serialize( GOOGLE_PHOTOS_PICKER_SESSION, sessionId, options );
};

export const retrieveGooglePhotosPickerSessionCookie = () => {
	const cookies = cookie.parse( document.cookie );

	return cookies[ GOOGLE_PHOTOS_PICKER_SESSION ];
};
