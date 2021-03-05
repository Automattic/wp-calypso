/**
 * Internal dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import {
	WOOCOMMERCE_SHIPPING_METHODS_REQUEST,
	WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

// TODO: Handle error

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_METHODS_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS: {
			const { data } = action;
			return data;
		}
	}

	return state;
} );
