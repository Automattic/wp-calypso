import 'calypso/state/woo-admin-menu/init';
import 'calypso/state/data-layer/wpcom/sites/woo-admin-menu';
import { WOO_ADMIN_MENU_REQUEST, WOO_ADMIN_MENU_RECEIVE } from 'calypso/state/action-types';

export const requestWooAdminMenu = function requestWooAdminMenu( siteId ) {
	return {
		type: WOO_ADMIN_MENU_REQUEST,
		siteId,
	};
};

export const receiveWooAdminMenu = function receiveWooAdminMenu( siteId, menuData ) {
	return {
		type: WOO_ADMIN_MENU_RECEIVE,
		siteId,
		menuData,
	};
};
