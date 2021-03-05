/**
 * External dependencies
 */

import { get } from 'lodash';

export function getLastApiError( rootState, siteId ) {
	const woocommerce = rootState.extensions.woocommerce;
	return get( woocommerce, [ 'site', siteId, 'status', 'wcApi', 'error', 'data' ] );
}

export function getLastApiErrorCode( rootState, siteId ) {
	const err = getLastApiError( rootState, siteId );
	return err ? err.code : undefined;
}

export function getLastApiErrorMessage( rootState, siteId ) {
	const err = getLastApiError( rootState, siteId );
	return err ? err.message : undefined;
}
