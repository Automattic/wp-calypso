/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import { WOOCOMMERCE_ERROR_SET, WOOCOMMERCE_ERROR_CLEAR } from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:errors:wc-api' );

export default createReducer( null, {
	[ WOOCOMMERCE_ERROR_SET ]: setApiError,
	[ WOOCOMMERCE_ERROR_CLEAR ]: clearApiError,
} );

function setApiError( error, { data, originalAction, time } ) {
	const newError = { data, originalAction, time };

	debug( 'WC-API error occurred: ', newError );

	return newError;
}

function clearApiError() {
	return null;
}
