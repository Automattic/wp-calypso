/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { CHECKOUT_TOGGLE_CART_ON_MOBILE } from 'state/action-types';

function isShowingCartOnMobile( state = false, action ) {
	switch ( action.type ) {
		case CHECKOUT_TOGGLE_CART_ON_MOBILE:
			return ! state;
		default:
			return state;
	}
}

export default combineReducers( {
	isShowingCartOnMobile,
} );
