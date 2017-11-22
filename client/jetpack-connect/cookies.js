/** @format */
/**
 * External dependencies
 */
import cookie from 'cookie';

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
