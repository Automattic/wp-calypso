/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_TTL_SECONDS } from 'calypso/state/jetpack-connect/constants';
import { urlToSlug } from 'calypso/lib/url';

const SESSION_STORAGE_SELECTED_PLAN = 'jetpack_connect_selected_plan';

/**
 * Utilities for storing jetpack connect state that needs to persist across
 * logins and redirects. Session Storage work well for this, since redux
 * state is not guaranteed to be persisted in these scenarios.
 *
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
