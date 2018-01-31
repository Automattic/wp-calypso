/**
 * External dependencies
 *
 * @format
 */

import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { ERROR } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_EMAIL_SETTINGS_RECEIVE,
	WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
	WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS,
	WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_EMAIL_SETTINGS_RECEIVE ]: ( state, { data, error } ) => {
		if ( error ) {
			return ERROR;
		}
		return data;
	},

	[ WOOCOMMERCE_EMAIL_SETTINGS_CHANGE ]: ( state, { setting } ) => {
		if ( ! setting && ! setting.setting && ! setting.option ) {
			return state;
		}

		const settings = Object.assign( {}, state );
		settings[ setting.setting ][ setting.option ].value = setting.value;
		return settings;
	},

	[ WOOCOMMERCE_EMAIL_SETTINGS_SAVE_SETTINGS ]: state => {
		//change to INIT_UPDATE
		const settings = Object.assign( {}, state );
		settings.save = true;
		return settings;
	},

	[ WOOCOMMERCE_EMAIL_SETTINGS_INVALID_VALUE ]: ( state, reason ) => {
		const settings = Object.assign( {}, omit( state, [ 'save', 'isSaving' ] ) );
		settings.invalidValue = reason;
		return settings;
	},
} );
