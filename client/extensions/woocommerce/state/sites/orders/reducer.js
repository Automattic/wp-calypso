/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error
export default createReducer( {}, {
	[ WOOCOMMERCE_ORDERS_REQUEST ]: () => LOADING,
	[ WOOCOMMERCE_ORDERS_REQUEST_FAILURE ]: () => false,
	[ WOOCOMMERCE_ORDERS_REQUEST_SUCCESS ]: ( state, { data } ) => data,
} );
