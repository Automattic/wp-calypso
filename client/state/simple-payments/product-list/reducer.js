/**
 * Internal dependencies
 */
import productListSchema from './schema';
import { combineReducers, createReducer } from 'state/utils';
import {
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_REQUESTING,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_SUCCESS,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_FAIL,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to a boolean value. Each site is true if roles
 * for it are being currently requested, and false otherwise.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( {}, {
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_REQUESTING ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_FAIL ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

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
export const items = createReducer( {}, {
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE ]: ( state, { siteId, products } ) => ( { ...state, [ siteId ]: products } ),
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE ]:
		( state, { siteId, product } ) => ( { ...state, [ siteId ]: addOrEditProduct( state[ siteId ], product ) } ),
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE ]: ( state, { siteId, productId } ) => ( { ...state, [ siteId ]: state[ siteId ].filter(
		product => product.ID !== productId
	) } ),
}, productListSchema );

export default combineReducers( {
	requesting,
	items
} );
