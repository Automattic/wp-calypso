/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL,
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
