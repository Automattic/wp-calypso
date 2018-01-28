/** @format */
/**
 * Internal dependencies
 */
import {
	SIDEBAR_ROUTE_SET,
	SIDEBAR_ROUTE_TRANSITION_SET,
	SIDEBAR_ROUTE_TRANSITION_DONE,
} from 'state/action-types';

export const setSidebarRoute = route => dispatch => {
	dispatch( {
		type: SIDEBAR_ROUTE_SET,
		route,
	} );
};

export const startSidebarTransition = ( route, direction ) => dispatch => {
	console.log('---- start transition');
	dispatch( {
		type: SIDEBAR_ROUTE_TRANSITION_SET,
		route,
		direction,
	} );
};

export const endSidebarTransition = () => dispatch => {
	console.log('==== end transition');
	dispatch( {
		type: SIDEBAR_ROUTE_TRANSITION_DONE,
	} );
};
