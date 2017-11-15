/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import { ERROR, LOADING } from 'woocommerce/state/constants';
import { updateSettings } from '../helpers';
import {
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},

	[ WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS ]: ( state, { data } ) => {
		if ( ! data || ! data.update ) {
			return state;
		}

		return updateSettings( 'products', state || [], data );
	},

	[ WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE ]: () => {
		return ERROR;
	},

	[ WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return updateSettings( 'products', state || [], data );
	},
} );
