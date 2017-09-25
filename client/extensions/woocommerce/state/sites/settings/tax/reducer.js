/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST, WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST_SUCCESS, WOOCOMMERCE_SETTINGS_TAX_REQUEST, WOOCOMMERCE_SETTINGS_TAX_REQUEST_SUCCESS } from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

export default createReducer( null, {
	[ WOOCOMMERCE_SETTINGS_TAX_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SETTINGS_TAX_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},

	[ WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST ]: ( state ) => {
		return state;
	},

	[ WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const settings = state || [];

		// go through each existing setting
		// if an update is present in data, replace the setting with the update
		const newSettings = settings.map( ( setting ) => {
			const update = find( data.update, { id: setting.id } );
			if ( update ) {
				return update;
			}
			return setting;
		} );

		// if update adds adds a new setting, append it to settings
		data.update.forEach( ( update ) => {
			if ( ! find( settings, { id: update.id } ) ) {
				newSettings.push( update );
			}
		} );

		return newSettings;
	},
} );
