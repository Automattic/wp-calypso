/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { CART_SYNC } from 'state/action-types';

export const cartSync = createReducer( null, {
	[ CART_SYNC ]: ( state, { cart } ) => ( { cart } ),
} );

export default cartSync;
