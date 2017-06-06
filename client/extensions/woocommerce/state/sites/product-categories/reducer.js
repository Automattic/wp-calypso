/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
