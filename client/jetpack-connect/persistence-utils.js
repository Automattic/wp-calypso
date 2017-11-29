/** @format */
/**
 * External dependencies
 */
import cookie from 'cookie';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { FLOW_TYPES, JETPACK_CONNECT_TTL_SECONDS } from 'state/jetpack-connect/constants';
import { urlToSlug } from 'lib/url';

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

export const persistSession = url => {
	const options = {
		maxAge: JETPACK_CONNECT_TTL_SECONDS,
		path: '/',
	};
	document.cookie = cookie.serialize( 'jetpack_connect_session_url', urlToSlug( url ), options );
};

export const isCalypsoStartedConnection = siteSlug => {
	const cookies = cookie.parse( document.cookie );
	return cookies.jetpack_connect_session_url === urlToSlug( siteSlug );
};

export const clearFlowType = () => {
	const options = { path: '/' };
	document.cookie = cookie.serialize( 'jetpack_connect_session_flowtype', '', options );
};

export const persistFlowType = flowType => {
	if ( ! includes( FLOW_TYPES, flowType ) ) {
		clearFlowType();
		return;
	}
	const options = { path: '/' };
	document.cookie = cookie.serialize( 'jetpack_connect_session_flowtype', flowType, options );
};

export const retrieveFlowType = () => {
	const cookies = cookie.parse( document.cookie );
	return cookies.jetpack_connect_session_flowtype;
};
