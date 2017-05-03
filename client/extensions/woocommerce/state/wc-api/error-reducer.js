/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_SET_ERROR,
	WOOCOMMERCE_API_CLEAR_ERROR,
} from '../action-types';

const debug = debugFactory( 'woocommerce:wc-api:error' );

export default {
	[ WOOCOMMERCE_API_SET_ERROR ]: setApiError,
	[ WOOCOMMERCE_API_CLEAR_ERROR ]: clearApiError,
};

function setApiError( siteState, action ) {
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

