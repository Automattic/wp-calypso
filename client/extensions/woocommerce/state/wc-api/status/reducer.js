/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_WC_API_SUCCESS,
	WOOCOMMERCE_WC_API_UNAVAILABLE,
	WOOCOMMERCE_WC_API_UNKNOWN_ERROR,
} from 'woocommerce/state/action-types';

const initialState = {
	status: 'uninitialized',
	lastSuccessTime: null,
	lastErrorTime: null,
};

export default createReducer( initialState, {
	[ WOOCOMMERCE_WC_API_SUCCESS ]: apiSuccess,
	[ WOOCOMMERCE_WC_API_UNAVAILABLE ]: apiUnavailable,
	[ WOOCOMMERCE_WC_API_UNKNOWN_ERROR ]: apiUnknownError,
} );

function apiSuccess( state, action ) {
	const actionTime = action.time || Date.now();

	return {
		...state,
		status: 'available',
		lastSuccessTime: actionTime,
	};
}

function apiUnavailable( state, action ) {
	const actionTime = action.time || Date.now();

	return {
		...state,
		status: 'unavailable',
		lastErrorTime: actionTime,
	};
}

function apiUnknownError( state, action ) {
	const actionTime = action.time || Date.now();

	return {
		...state,
		status: 'unknown_error',
		lastErrorTime: actionTime,
	};
}
