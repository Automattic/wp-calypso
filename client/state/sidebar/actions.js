/** @format */
/**
 * Internal dependencies
 */
import { SIDEBAR_ROUTE_SET } from 'state/action-types';

export const setSidebarRoute = route => dispatch => {
	dispatch( {
		type: SIDEBAR_ROUTE_SET,
		route,
	} );
};
