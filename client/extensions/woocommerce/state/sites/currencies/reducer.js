/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'client/state/utils';
import {
	WOOCOMMERCE_CURRENCIES_REQUEST,
	WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS,
} from 'client/extensions/woocommerce/state/action-types';
import { LOADING } from 'client/extensions/woocommerce/state/constants';

// TODO: Handle error

export default createReducer( null, {
	[ WOOCOMMERCE_CURRENCIES_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
