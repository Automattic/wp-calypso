/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_AUTH_COOKIE_REQUEST,
	WOOCOMMERCE_AUTH_COOKIE_RECEIVED,
	WOOCOMMERCE_AUTH_COOKIE_FAILED,
} from 'woocommerce/state/action-types';

export function requestCookieAuth( siteId ) {
	return {
		type: WOOCOMMERCE_AUTH_COOKIE_REQUEST,
		siteId,
	};
}

export function cookieAuthReceived( siteId ) {
	return {
		type: WOOCOMMERCE_AUTH_COOKIE_RECEIVED,
		siteId,
	};
}

export function cookieAuthFailed( siteId ) {
	return {
		type: WOOCOMMERCE_AUTH_COOKIE_FAILED,
		siteId,
	};
}
