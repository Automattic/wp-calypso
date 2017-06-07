/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_PAYMENT_METHODS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
