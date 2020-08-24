/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

export default withoutPersistence( function ( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_CLASSES_REQUEST:
			return LOADING;
		case WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS:
			return action.data;
	}
	return state;
} );
