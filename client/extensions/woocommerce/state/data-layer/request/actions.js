/**
 * External dependencies
 */
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_REQUEST,
} from 'woocommerce/state/action-types';

function _createRequestAction( method, siteId, path, body ) {
	return {
		type: WOOCOMMERCE_API_REQUEST,
		requestId: uniqueId( 'request_' ),
		method,
		siteId,
		path,
		body,
	};
}

export function get( siteId, path ) {
	return _createRequestAction( 'get', siteId, path );
}

export function post( siteId, path, body ) {
	return _createRequestAction( 'post', siteId, path, body );
}

export function put( siteId, path, body ) {
	return _createRequestAction( 'put', siteId, path, body );
}

export function del( siteId, path ) {
	return _createRequestAction( 'del', siteId, path );
}

