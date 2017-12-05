/**
 * External dependencies
 */
import { setWith } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS,
	WOOCOMMERCE_EMAIL_SETTINGS_CHANGE,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_EMAIL_SETTINGS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const options = {};
		data.forEach( function( option ) {
			setWith( options, [ option.group_id, option.id ], option.value, Object );
		} );
		return options;
	},

	[ WOOCOMMERCE_EMAIL_SETTINGS_CHANGE ]: ( state, { setting } ) => {
		if ( ! setting ) {
			return state;
		}

		const settings = Object.assign( {}, state );
		settings[ setting.setting ][ setting.option ] = setting.value;
		return settings;
	},
} );
