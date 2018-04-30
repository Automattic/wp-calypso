/** @format */

/**
 * Internal dependencies
 */

import productListSchema from './schema';
import { combineReducers, createReducer } from 'state/utils';
import {
	SIMPLE_PAYMENTS_PRODUCT_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
	MEMBERSHIPS_PRODUCTS_RECEIVE,
} from 'state/action-types';

/**
 * Edits existing product if one with matching ID found.
 * Otherwise inserts the new one at the beginning of the list.
 * @param {Array} list of previous products
 * @param {Object} newProduct to update list with
 * @returns {Array} updated array of products
 */
function addOrEditProduct( list = [], newProduct ) {
	let found = 0;
	const products = list.map( product => {
		if ( product.ID === newProduct.ID ) {
			found = 1;
			return newProduct;
		}
		return product;
	} );
	if ( ! found ) {
		return [ newProduct, ...products ];
	}
	return products;
}

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
		[ SIMPLE_PAYMENTS_PRODUCT_RECEIVE ]: ( state, { siteId, product } ) => ( {
			...state,
			[ siteId ]: addOrEditProduct( state[ siteId ], product ),
		} ),
		[ SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE ]: ( state, { siteId, products } ) => ( {
			...state,
			[ siteId ]: ( state[ siteId ]
				? state[ siteId ].filter( item => !! item.recurring )
				: []
			).concat( products ),
		} ),
		[ MEMBERSHIPS_PRODUCTS_RECEIVE ]: ( state, { siteId, products } ) => ( {
			...state,
			[ siteId ]: ( state[ siteId ]
				? state[ siteId ].filter( item => ! item.recurring )
				: []
			).concat( products ),
		} ),
		[ SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE ]: ( state, { siteId, product } ) => ( {
			...state,
			[ siteId ]: addOrEditProduct( state[ siteId ], product ),
		} ),
		[ SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE ]: ( state, { siteId, productId } ) => ( {
			...state,
			[ siteId ]: state[ siteId ].filter( product => product.ID !== productId ),
		} ),
	},
	productListSchema
);

export default combineReducers( {
	items,
} );
