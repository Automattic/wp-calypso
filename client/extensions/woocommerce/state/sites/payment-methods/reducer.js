/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_PAYMENT_METHOD_ENABLED_UPDATE,
	WOOCOMMERCE_PAYMENT_METHOD_ENABLED_UPDATE_SUCCESS,
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,

} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer( {}, {
	[ WOOCOMMERCE_PAYMENT_METHOD_ENABLED_UPDATE ]: ( state ) => {
		// TODO: Return some sort of saving indicator on method being enabled
		return state;
	},

	[ WOOCOMMERCE_PAYMENT_METHOD_ENABLED_UPDATE_SUCCESS ]: ( state, { data } ) => {
		// Replaces method in state methods state array with data from server
		const methods = state || [];
		const newMethods = methods.map( ( method ) => {
			if ( method.id === data.id ) {
				return data;
			}
			return method;
		} );
		return newMethods;
	},
	[ WOOCOMMERCE_PAYMENT_METHOD_UPDATE ]: ( state ) => {
		// TODO: Return some sort of saving indicator
		return state;
	},
	[ WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS ]: ( state, { data } ) => {
		const methods = state || [];
		const newMethods = methods.map( ( method ) => {
			if ( method.id === data.id ) {
				return data;
			}
			return method;
		} );
		return newMethods;
	},

	[ WOOCOMMERCE_PAYMENT_METHODS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
