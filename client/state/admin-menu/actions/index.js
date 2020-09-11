/**
 * Internal dependencies
 */
import 'state/inline-help/init';
import 'state/data-layer/wpcom/sites/admin-menu';
import { ADMIN_MENU_REQUEST, ADMIN_MENU_RECEIVE } from 'state/action-types';

export const requestAdminMenu = function requestAdminMenu( siteId ) {
	return {
		type: ADMIN_MENU_REQUEST,
		siteId,
	};
};

export const receiveAdminMenu = function receiveAdminMenu( siteId, menu ) {
	return {
		type: ADMIN_MENU_RECEIVE,
		siteId,
		menu,
	};
};
