/**
 * Internal dependencies
 */
import 'state/inline-help/init';
import 'state/data-layer/wpcom/admin-menu';
import { ADMIN_MENU_REQUEST } from 'state/action-types';

export const requestAdminMenu = function requestAdminMenu() {
	return {
		type: ADMIN_MENU_REQUEST,
	};
};
