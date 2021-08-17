import { createRequestCartProducts } from './create-request-cart-product';
import type {
	AddProductsToCart,
	ReplaceProductsInCart,
	RemoveProductFromCart,
	ReplaceProductInCart,
	UpdateTaxLocationInCart,
	ApplyCouponToCart,
	RemoveCouponFromCart,
	ReloadCartFromServer,
	RequestCartProduct,
	DispatchAndWaitForValid,
	ShoppingCartActionCreators,
} from './types';

export function createActionCreators(
	dispatch: DispatchAndWaitForValid
): ShoppingCartActionCreators {
	const removeCoupon: RemoveCouponFromCart = () => dispatch( { type: 'REMOVE_COUPON' } );
	const addProductsToCart: AddProductsToCart = async ( products ) =>
		dispatch( {
			type: 'CART_PRODUCTS_ADD',
			products: createRequestCartProducts( products ),
		} );
	const removeProductFromCart: RemoveProductFromCart = ( uuidToRemove ) =>
		dispatch( { type: 'REMOVE_CART_ITEM', uuidToRemove } );
	const replaceProductsInCart: ReplaceProductsInCart = async ( products ) =>
		dispatch( {
			type: 'CART_PRODUCTS_REPLACE_ALL',
			products: createRequestCartProducts( products ),
		} );
	const replaceProductInCart: ReplaceProductInCart = (
		uuidToReplace: string,
		productPropertiesToChange: Partial< RequestCartProduct >
	) =>
		dispatch( {
			type: 'CART_PRODUCT_REPLACE',
			uuidToReplace,
			productPropertiesToChange,
		} );
	const updateLocation: UpdateTaxLocationInCart = ( location ) =>
		dispatch( { type: 'SET_LOCATION', location } );
	const applyCoupon: ApplyCouponToCart = ( newCoupon ) =>
		dispatch( { type: 'ADD_COUPON', couponToAdd: newCoupon } );
	const reloadFromServer: ReloadCartFromServer = () => dispatch( { type: 'CART_RELOAD' } );
	return {
		reloadFromServer,
		applyCoupon,
		updateLocation,
		replaceProductInCart,
		replaceProductsInCart,
		removeProductFromCart,
		addProductsToCart,
		removeCoupon,
	};
}
