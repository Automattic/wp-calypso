/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	WOOCOMMERCE_API_SET_ERROR,
	WOOCOMMERCE_API_CLEAR_ERROR,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:errors:wc-api' );

export default createReducer( null, {
	[ WOOCOMMERCE_API_SET_ERROR ]: setApiError,
	[ WOOCOMMERCE_API_CLEAR_ERROR ]: clearApiError,
} );

function setApiError( error, action ) {
	const { data, originalAction, time } = action.payload;
	const newError = { data, originalAction, time };

	debug( 'WC-API error occurred: ', newError );

	return newError;
}

function clearApiError() {
	return null;
}

