/**
 * Internal dependencies
 */
import 'calypso/state/admin-menu/init';
import 'calypso/state/data-layer/wpcom/sites/admin-menu';
import { ADMIN_MENU_REQUEST, ADMIN_MENU_RECEIVE } from 'calypso/state/action-types';

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
