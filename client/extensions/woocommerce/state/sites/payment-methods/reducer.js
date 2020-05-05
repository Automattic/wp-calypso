/**
 * Internal dependencies
 */

import { withoutPersistence } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS: {
			const { data } = action;
			const methods = state || [];
			const newMethods = methods.map( ( method ) => {
				if ( method.id === data.id ) {
					return data;
				}
				return method;
			} );
			return newMethods;
		}
		case WOOCOMMERCE_PAYMENT_METHODS_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS: {
			const { data } = action;
			return data;
		}
	}

	return state;
} );
