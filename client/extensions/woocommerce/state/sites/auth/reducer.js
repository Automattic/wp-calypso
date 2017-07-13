/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_AUTH_COOKIE_REQUEST,
	WOOCOMMERCE_AUTH_COOKIE_RECEIVED,
	WOOCOMMERCE_AUTH_COOKIE_FAILED,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_AUTH_COOKIE_REQUEST ]: cookieAuthRequested,
	[ WOOCOMMERCE_AUTH_COOKIE_RECEIVED ]: cookieAuthReceived,
	[ WOOCOMMERCE_AUTH_COOKIE_FAILED ]: cookieAuthFailed,
} );

function cookieAuthRequested() {
	return LOADING;
}

function cookieAuthReceived( state, action ) {
	const { root, cookie, nonce } = action.data;

	console.log( 'cookie auth received' );
	return {
		root,
		cookie,
		nonce,
	};
}

function cookieAuthFailed() {
	return null;
}

