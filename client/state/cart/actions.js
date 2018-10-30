/**
 * @format
 */

/**
 * External dependencies
 *
 */
import { sum, values, once } from 'lodash';

/**
 * Internal dependencies
 */
import { CART_SYNC } from 'state/action-types';
import CartStore from 'lib/cart/store';

const listeners = {};

let listener = null;

// Dispatch the current cart, call from constructor
export const cartSync = () => dispatch => {
	dispatch( {
		type: CART_SYNC,
		cart: CartStore.get(),
	} );
};

// Sets up a listener, call this in your contructor
export const cartSyncOn = key => dispatch => {
	// Set marker
	listeners[ key ] = 1;

	// Only register / set the listener once
	if ( sum( listeners ) === 1 ) {
		listener = () => {
			dispatch( {
				type: CART_SYNC,
				cart: CartStore.get(),
			} );
		};

		CartStore.on( 'change', listener );
	}
};

// Call this in componentWillUnmount
export const cartSyncOff = key => () => {
	listeners[ key ] = 0;

	// Only deregister once
	if ( sum( listeners ) === 0 && listener !== null ) {
		listener = null;
		CartStore.off( 'change', listener );
	}
};

export default {
	cartSync,
	cartSyncOff,
	cartSyncOn,
};
