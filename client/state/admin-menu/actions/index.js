/**
 * Internal dependencies
 */
import 'state/inline-help/init';
import 'state/data-layer/wpcom/admin-menu';
import { ADMIN_MENU_FETCH } from 'state/action-types';

export const fetchAdminMenu = function fetchAdminMenu() {
	return {
		type: ADMIN_MENU_FETCH,
	};
};
