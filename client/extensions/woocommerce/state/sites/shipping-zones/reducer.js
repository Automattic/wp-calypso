/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_API_FETCH_SHIPPING_ZONES ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
