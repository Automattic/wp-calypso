/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import { updateSettings } from '../helpers';
import {
	WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST,
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_FAILURE,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS,
	WOOCOMMERCE_TAXES_ENABLED_UPDATE,
	WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( null, {
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

	[ WOOCOMMERCE_TAXES_ENABLED_UPDATE ]: ( state ) => {
		return state;
	},

	[ WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS ]: ( state, { data } ) => {
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

	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_FAILURE ]: () => {
		return null;
	},

	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},

	[ WOOCOMMERCE_SETTINGS_BATCH_REQUEST ]: ( state ) => {
		return state;
	},

	[ WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return updateSettings( 'general', state || [], data );
	},
} );
