/**
 * External dependencies
 */
import { setWith } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'client/state/utils';
import { LOADING } from 'client/extensions/woocommerce/state/constants';
import { WOOCOMMERCE_EMAIL_SETTINGS_REQUEST, WOOCOMMERCE_EMAIL_SETTINGS_REQUEST_SUCCESS } from 'client/extensions/woocommerce/state/action-types';

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
} );
