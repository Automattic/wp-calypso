/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
