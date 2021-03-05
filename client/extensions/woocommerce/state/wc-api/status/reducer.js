/**
 * Internal dependencies
 */
import { withoutPersistence } from 'calypso/state/utils';
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

export default withoutPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_WC_API_SUCCESS:
			return apiSuccess( state, action );
		case WOOCOMMERCE_WC_API_UNAVAILABLE:
			return apiUnavailable( state, action );
		case WOOCOMMERCE_WC_API_UNKNOWN_ERROR:
			return apiUnknownError( state, action );
	}

	return state;
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
