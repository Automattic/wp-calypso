/** @format */

/**
 * Internal dependencies
 */

import productListSchema from './schema';
import { combineReducers, createReducer } from 'state/utils';
import { MEMBERSHIPS_PRODUCTS_RECEIVE } from 'state/action-types';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site roles.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer(
	{},
	{
		[ MEMBERSHIPS_PRODUCTS_RECEIVE ]: ( state, { siteId, products } ) => ( {
			...state,
			[ siteId ]: products,
		} ),
	},
	productListSchema
);

export default combineReducers( {
	items,
} );
