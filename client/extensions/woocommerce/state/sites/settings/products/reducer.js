/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
