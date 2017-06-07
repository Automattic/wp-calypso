/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_SHIPPING_ZONES_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
