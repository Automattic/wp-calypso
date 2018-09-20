/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import { ERROR, LOADING } from 'woocommerce/state/constants';
import { isNull } from 'lodash';
import { updateSettings } from '../helpers';
import {
	WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_GENERAL_REQUEST,
	WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE,
	WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( null, {
	[ WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS ]: ( state, { data } ) => {
		const settings = state || [];
		const newSettings = settings.map( setting => {
			if ( setting.id === data.id ) {
				return data;
			}
			return setting;
		} );
		return newSettings;
	},

	[ WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS ]: ( state, { data } ) => {
		const settings = state || [];
		const newSettings = settings.map( setting => {
			if ( setting.id === data.id ) {
				return data;
			}
			return setting;
		} );
		return newSettings;
	},

	[ WOOCOMMERCE_SETTINGS_GENERAL_REQUEST ]: (
		state,
		{
			meta: {
				dataLayer: { error, data },
			},
		}
	) => {
		// Don't set the loading indicator if data has previously been loaded,
		// or if the data layer is dispatching with meta attached.
		if ( ! data && ! error && ( isNull( state ) || ERROR === state ) ) {
			return LOADING;
		}
		return state;
	},

	[ WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE ]: ( state, { data, error } ) => {
		if ( error ) {
			return ERROR;
		}
		return data;
	},

	[ WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return updateSettings( 'general', state || [], data );
	},
} );
