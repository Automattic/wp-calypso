/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_CURRENCIES_REQUEST,
	WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

// TODO: Handle error

export default createReducer( null, {
	[ WOOCOMMERCE_CURRENCIES_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
