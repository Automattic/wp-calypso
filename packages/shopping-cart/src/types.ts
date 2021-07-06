/**
 * External dependencies
 */
import type { Dispatch } from 'react';

/**
 * Internal dependencies
 */
import type {
	TempResponseCart,
	ResponseCart,
	RequestCart,
	RequestCartProduct,
	CartLocation,
	MinimalRequestCartProduct,
} from './shopping-cart-endpoint';

export * from './shopping-cart-endpoint';

export interface ShoppingCartManagerArguments {
	cartKey: string | number | null | undefined;
	setCart: ( cartKey: string, requestCart: RequestCart ) => Promise< ResponseCart >;
	getCart: ( cartKey: string ) => Promise< ResponseCart >;
	options?: ShoppingCartManagerOptions;
}

export interface ShoppingCartManagerOptions {
	refetchOnWindowFocus?: boolean;
}

export interface ShoppingCartManager {
	isLoading: boolean;
	loadingError: string | null | undefined;
	loadingErrorType: ShoppingCartError | undefined;
	isPendingUpdate: boolean;
	addProductsToCart: AddProductsToCart;
	removeProductFromCart: RemoveProductFromCart;
	applyCoupon: ApplyCouponToCart;
	removeCoupon: RemoveCouponFromCart;
	couponStatus: CouponStatus;
	updateLocation: UpdateTaxLocationInCart;
	replaceProductInCart: ReplaceProductInCart;
	replaceProductsInCart: ReplaceProductsInCart;
	reloadFromServer: ReloadCartFromServer;
	responseCart: ResponseCart;
}

export type ReplaceProductInCart = (
	uuidToReplace: string,
	productPropertiesToChange: Partial< RequestCartProduct >
) => Promise< ResponseCart >;

export type ReloadCartFromServer = () => Promise< ResponseCart >;

export type ReplaceProductsInCart = (
	products: MinimalRequestCartProduct[]
) => Promise< ResponseCart >;

export type AddProductsToCart = (
	products: MinimalRequestCartProduct[]
) => Promise< ResponseCart >;

export type RemoveCouponFromCart = () => Promise< ResponseCart >;

export type ApplyCouponToCart = ( couponId: string ) => Promise< ResponseCart >;

export type RemoveProductFromCart = ( uuidToRemove: string ) => Promise< ResponseCart >;

export type UpdateTaxLocationInCart = ( location: CartLocation ) => Promise< ResponseCart >;

/**
 * The custom hook keeps a cached version of the server cart, as well as a
 * cache status.
 *
 *   - 'fresh': Page has loaded and no requests have been sent.
 *   - 'fresh-pending': Page has loaded and we are waiting for the initial request.
 *   - 'invalid': Local cart data has been edited.
 *   - 'valid': Local cart has been reloaded from the server.
 *   - 'pending': Request has been sent, awaiting response.
 *   - 'error': Something went wrong.
 */
export type CacheStatus = 'fresh' | 'fresh-pending' | 'valid' | 'invalid' | 'pending' | 'error';

/**
 * Possible states re. coupon submission.
 *
 *   - 'fresh': User has not (yet) attempted to apply a coupon.
 *   - 'pending': Coupon request has been sent, awaiting response.
 *   - 'applied': Coupon has been applied to the cart.
 *   - 'rejected': Coupon code did not apply. The reason should be in the cart errors.
 */
export type CouponStatus = 'fresh' | 'pending' | 'applied' | 'rejected';

export type ShoppingCartAction =
	| { type: 'SYNC_CART_TO_SERVER' }
	| { type: 'CLEAR_QUEUED_ACTIONS' }
	| { type: 'REMOVE_CART_ITEM'; uuidToRemove: string }
	| { type: 'CART_PRODUCTS_ADD'; products: RequestCartProduct[] }
	| { type: 'CART_PRODUCTS_REPLACE_ALL'; products: RequestCartProduct[] }
	| { type: 'SET_LOCATION'; location: CartLocation }
	| {
			type: 'CART_PRODUCT_REPLACE';
			uuidToReplace: string;
			productPropertiesToChange: Partial< RequestCartProduct >;
	  }
	| { type: 'ADD_COUPON'; couponToAdd: string }
	| { type: 'REMOVE_COUPON' }
	| { type: 'CART_RELOAD' }
	| { type: 'RECEIVE_INITIAL_RESPONSE_CART'; initialResponseCart: ResponseCart }
	| { type: 'FETCH_INITIAL_RESPONSE_CART' }
	| { type: 'REQUEST_UPDATED_RESPONSE_CART' }
	| { type: 'RECEIVE_UPDATED_RESPONSE_CART'; updatedResponseCart: ResponseCart }
	| { type: 'RAISE_ERROR'; error: ShoppingCartError; message: string };

export type ShoppingCartError = 'GET_SERVER_CART_ERROR' | 'SET_SERVER_CART_ERROR';

export type ShoppingCartState = {
	responseCart: TempResponseCart;
	couponStatus: CouponStatus;
	cacheStatus: CacheStatus;
	loadingError?: string;
	loadingErrorType?: ShoppingCartError;
	queuedActions: ShoppingCartAction[];
};

export type CartValidCallback = ( cart: ResponseCart ) => void;

export type DispatchAndWaitForValid = ( action: ShoppingCartAction ) => Promise< ResponseCart >;

export type ShoppingCartMiddleware = (
	action: ShoppingCartAction,
	state: ShoppingCartState,
	dispatch: Dispatch< ShoppingCartAction >
) => void;
