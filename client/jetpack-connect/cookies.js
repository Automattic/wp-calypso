/** @format */
/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Utilities for storing jetpack connect state that needs to persist across
 * logins and redirects. Cookies work well for this, since redux
 * state is not guaranteed to be persisted in these scenarios.
 */

export const storePlan = planSlug => {
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
