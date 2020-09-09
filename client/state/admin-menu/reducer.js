/**
 * Internal dependencies
 */
// import { ADMIN_MENU_FETCH } from 'state/action-types';
import { combineReducers, keyedReducer, withStorageKey } from 'state/utils';
import 'state/data-layer/wpcom/admin-menu';

export const adminMenu = ( state = [], action ) => {
	switch ( action.type ) {
		default:
			return state;
	}
};

const combinedReducer = combineReducers( {
	adminMenu,
} );

// export default withStorageKey( 'adminMenu', combinedReducer );

export default combinedReducer;
