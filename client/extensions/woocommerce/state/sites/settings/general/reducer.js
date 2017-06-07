/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
