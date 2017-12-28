/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'client/state/utils';
import {
	WOOCOMMERCE_SHIPPING_METHODS_REQUEST,
	WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS,
} from 'client/extensions/woocommerce/state/action-types';
import { LOADING } from 'client/extensions/woocommerce/state/constants';

// TODO: Handle error

export default createReducer( null, {
	[ WOOCOMMERCE_SHIPPING_METHODS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
