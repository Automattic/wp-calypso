/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_TTL_SECONDS } from 'state/jetpack-connect/constants';
import { urlToSlug } from 'lib/url';

/**
 * Utilities for storing jetpack connect state that needs to persist across
 * logins and redirects. Cookies work well for this, since redux
 * state is not guaranteed to be persisted in these scenarios.
 */

export const storePlan = ( planSlug ) => {
	const options = { path: '/' };
	document.cookie = cookie.serialize( 'jetpack_connect_selected_plan', planSlug, options );
};

export const clearPlan = () => {
	const options = { path: '/' };
	document.cookie = cookie.serialize( 'jetpack_connect_selected_plan', '', options );
};

export const retrievePlan = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.jetpack_connect_selected_plan;
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
