/**
 * Internal dependencies
 */

import { withoutPersistence } from 'calypso/state/utils';
import { ERROR, LOADING } from 'woocommerce/state/constants';
import { updateSettings } from '../helpers';
import {
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_CHANGE_SETTING,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE,
	WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

const update = ( state, { data } ) => {
	if ( ! data || ! data.update ) {
		return state;
	}

	return updateSettings( 'products', state || [], data );
};

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_SETTINGS_PRODUCTS_REQUEST_SUCCESS: {
			const { data } = action;
			return data;
		}
		case WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_SUCCESS:
			return update( state, action );
		case WOOCOMMERCE_SETTINGS_PRODUCTS_CHANGE_SETTING:
			return update( state, action );
		case WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS: {
			const { data } = action;
			return updateSettings( 'products', state || [], data );
		}
		case WOOCOMMERCE_SETTINGS_PRODUCTS_UPDATE_REQUEST_FAILURE: {
			return ERROR;
		}
	}

	return state;
} );
