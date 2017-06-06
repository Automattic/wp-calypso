/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS,
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_API_FETCH_PAYMENT_METHODS ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
