/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_ERROR,
	WOOCOMMERCE_API_ERROR_CLEAR,
} from '../action-types';

const debug = debugFactory( 'woocommerce:wc-api:error' );

export default {
	[ WOOCOMMERCE_API_ERROR ]: apiError,
	[ WOOCOMMERCE_API_ERROR_CLEAR ]: clearApiError,
};

function apiError( siteState, action ) {
	const { data, originalAction, time } = action.payload;
	const newError = { data, originalAction, time };

	debug( 'API error occurred: ', newError );

	return { ...siteState, error: newError };
}

function clearApiError( siteState ) {
	const { error, ...remaining } = siteState;

	debug( 'Clearing API error: ', error );

	return { ...remaining };
}

