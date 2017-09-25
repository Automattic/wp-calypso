/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_TAXRATES_REQUEST, WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS } from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

export default createReducer( {}, {
	[ WOOCOMMERCE_TAXRATES_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
