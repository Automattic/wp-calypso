/**
 * External dependencies
 */

import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST,
	WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_TAX_REQUEST,
	WOOCOMMERCE_SETTINGS_TAX_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SETTINGS_TAX_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_SETTINGS_TAX_REQUEST_SUCCESS: {
			const { data } = action;
			return data;
		}
		case WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST: {
			return state;
		}
		case WOOCOMMERCE_SETTINGS_TAX_BATCH_REQUEST_SUCCESS: {
			const { data } = action;
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
		}
	}

	return state;
} );
