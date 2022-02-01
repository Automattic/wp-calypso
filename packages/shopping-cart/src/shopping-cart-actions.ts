import { createRequestCartProducts } from './create-request-cart-product';
import type { DispatchAndWaitForValid, ShoppingCartManagerActions } from './types';

export function createActions( dispatch: DispatchAndWaitForValid ): ShoppingCartManagerActions {
	return {
		reloadFromServer: () => dispatch( { type: 'CART_RELOAD' } ),
		clearMessages: () => dispatch( { type: 'CLEAR_MESSAGES' } ),
		removeCoupon: () => dispatch( { type: 'REMOVE_COUPON' } ),
		addProductsToCart: async ( products ) =>
			dispatch( {
				type: 'CART_PRODUCTS_ADD',
				products: createRequestCartProducts( products ),
			} ),
		removeProductFromCart: ( uuidToRemove ) =>
			dispatch( { type: 'REMOVE_CART_ITEM', uuidToRemove } ),
		replaceProductsInCart: async ( products ) =>
			dispatch( {
				type: 'CART_PRODUCTS_REPLACE_ALL',
				products: createRequestCartProducts( products ),
			} ),
		replaceProductInCart: ( uuidToReplace, productPropertiesToChange ) =>
			dispatch( {
				type: 'CART_PRODUCT_REPLACE',
				uuidToReplace,
				productPropertiesToChange,
			} ),
		updateLocation: ( location ) => dispatch( { type: 'SET_LOCATION', location } ),
		applyCoupon: ( newCoupon ) => dispatch( { type: 'ADD_COUPON', couponToAdd: newCoupon } ),
	};
}
