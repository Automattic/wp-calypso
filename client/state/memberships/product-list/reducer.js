/**
 * Internal dependencies
 */
import productListSchema from './schema';
import { combineReducers, withSchemaValidation } from 'state/utils';
import {
	MEMBERSHIPS_PRODUCTS_RECEIVE,
	MEMBERSHIPS_PRODUCT_RECEIVE,
	MEMBERSHIPS_PRODUCT_DELETE,
} from 'state/action-types';

/**
 * Edits existing product if one with matching ID found.
 * Otherwise inserts the new one at the beginning of the list.
 *
 * @param {Array} list of previous products
 * @param {object} newProduct to update list with
 * @returns {Array} updated array of products
 */
function addOrEditProduct( list = [], newProduct ) {
	let found = 0;
	const products = list.map( ( product ) => {
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
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( productListSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_PRODUCTS_RECEIVE: {
			const { siteId, products } = action;

			return {
				...state,
				[ siteId ]: products,
			};
		}
		case MEMBERSHIPS_PRODUCT_RECEIVE: {
			const { siteId, product } = action;

			return {
				...state,
				[ siteId ]: addOrEditProduct( state[ siteId ], product ),
			};
		}
		case MEMBERSHIPS_PRODUCT_DELETE: {
			const { siteId, product } = action;

			return {
				...state,
				[ siteId ]: state[ siteId ].filter(
					( existingProduct ) => existingProduct.ID !== product.ID
				),
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
