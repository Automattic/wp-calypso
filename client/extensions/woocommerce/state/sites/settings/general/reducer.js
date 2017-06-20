/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_CURRENCY_UPDATE,
	WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_CURRENCY_UPDATE ]: ( state ) => {
		// TODO: Return some sort of saving indicator
		return state;
	},

	[ WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS ]: ( state, { data } ) => {
		const settings = state || [];
		const newSettings = settings.map( ( setting ) => {
			if ( setting.id === data.id ) {
				return data;
			}
			return setting;
		} );
		return newSettings;
	},
	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
