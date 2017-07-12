/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_AUTH_COOKIE_REQUEST,
} from 'woocommerce/state/action-types';
import { get } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { cookieAuthReceived, cookieAuthFailed } from './actions';

export default {
	[ WOOCOMMERCE_AUTH_COOKIE_REQUEST ]: [ handleCookieRequest ],
};

function handleCookieRequest( { dispatch }, action ) {
	const { siteId } = action;

	dispatch( get( siteId, 'auth', cookieAuthReceived( siteId ), failedAction( siteId, action ) ) );
}

function failedAction( siteId, action ) {
	return ( dispatch ) => {
		dispatch( setError( siteId, action ) );
		return cookieAuthFailed( siteId );
	};
}

