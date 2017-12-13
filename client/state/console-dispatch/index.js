/** @format */

/**
 * Console dispatcher Redux store enhancer
 *
 * Inject at the top of the `createStore` enhancer chain
 * to provide access to actionTypes and store methods directly
 * from the console.
 *
 * Will only attach if the `window` variable is available
 * globally. If not it will simply be an empty link in the
 * chain, passing straight through.
 */

/**
 * Internal dependencies
 */
import * as actionTypes from 'state/action-types';

export const consoleDispatcher = next => ( ...args ) => {
	const store = next( ...args );

	if ( 'undefined' !== typeof window ) {
		Object.assign( window, store, {
			actionTypes,
		} );

		Object.defineProperty( window, 'state', {
			enumerable: true,
			get: store.getState,
		} );
	}

	return store;
};

export default consoleDispatcher;
