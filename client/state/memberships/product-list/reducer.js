/**
 * Internal dependencies
 */
import productListSchema from './schema';
import { combineReducers, createReducerWithValidation } from 'state/utils';
import {
	MEMBERSHIPS_PRODUCTS_RECEIVE,
	MEMBERSHIPS_PRODUCT_RECEIVE,
	MEMBERSHIPS_PRODUCT_DELETE,
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
export const items = createReducerWithValidation(
	{},
	{
		[ MEMBERSHIPS_PRODUCTS_RECEIVE ]: ( state, { siteId, products } ) => ( {
			...state,
			[ siteId ]: products,
		} ),
		[ MEMBERSHIPS_PRODUCT_RECEIVE ]: ( state, { siteId, product } ) => ( {
			...state,
			[ siteId ]: addOrEditProduct( state[ siteId ], product ),
		} ),
		[ MEMBERSHIPS_PRODUCT_DELETE ]: ( state, { siteId, product } ) => ( {
			...state,
			[ siteId ]: state[ siteId ].filter( existingProduct => existingProduct.ID !== product.ID ),
		} ),
	},
	productListSchema
);

export default combineReducers( {
	items,
} );
