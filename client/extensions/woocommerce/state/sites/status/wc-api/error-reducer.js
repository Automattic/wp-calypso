/**
 * External dependencies
 */

import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'calypso/state/utils';
import { WOOCOMMERCE_ERROR_SET, WOOCOMMERCE_ERROR_CLEAR } from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:errors:wc-api' );

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_ERROR_SET:
			return setApiError( state, action );
		case WOOCOMMERCE_ERROR_CLEAR:
			return clearApiError( state, action );
	}

	return state;
} );

function setApiError( error, { data, originalAction, time } ) {
	const newError = { data, originalAction, time };

	debug( 'WC-API error occurred: ', newError );

	return newError;
}

function clearApiError() {
	return null;
}
