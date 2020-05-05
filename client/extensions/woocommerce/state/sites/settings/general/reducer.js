/**
 * Internal dependencies
 */

import { withoutPersistence } from 'state/utils';
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

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS: {
			const { data } = action;
			const settings = state || [];
			const newSettings = settings.map( ( setting ) => {
				if ( setting.id === data.id ) {
					return data;
				}
				return setting;
			} );
			return newSettings;
		}
		case WOOCOMMERCE_TAXES_ENABLED_UPDATE_SUCCESS: {
			const { data } = action;
			const settings = state || [];
			const newSettings = settings.map( ( setting ) => {
				if ( setting.id === data.id ) {
					return data;
				}
				return setting;
			} );
			return newSettings;
		}
		case WOOCOMMERCE_SETTINGS_GENERAL_REQUEST: {
			const {
				meta: {
					dataLayer: { error, data },
				},
			} = action;

			// Don't set the loading indicator if data has previously been loaded,
			// or if the data layer is dispatching with meta attached.
			if ( ! data && ! error && ( isNull( state ) || ERROR === state ) ) {
				return LOADING;
			}
			return state;
		}
		case WOOCOMMERCE_SETTINGS_GENERAL_RECEIVE: {
			const { data, error } = action;
			if ( error ) {
				return ERROR;
			}
			return data;
		}
		case WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS: {
			const { data } = action;
			return updateSettings( 'general', state || [], data );
		}
	}

	return state;
} );
