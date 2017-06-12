/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { createReducer } from 'state/utils';

export default createReducer( {}, {
	[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const newState = { ...state };
		data.forEach( method => {
			newState[ method.id ] = method;
		} );

		return newState;
	},
} );
