/**
 * Internal dependencies
 */

import { withStorageKey } from 'state/utils';
import 'state/data-layer/wpcom/admin-menu';
import { ADMIN_MENU_RECEIVE } from 'state/action-types';

export const adminMenu = ( state = {}, action ) => {
	switch ( action.type ) {
		case ADMIN_MENU_RECEIVE:
			return { ...state, ...action.menu };
		default:
			return state;
	}
};

export default withStorageKey( 'adminMenu', adminMenu );
