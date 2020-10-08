/**
 * Internal dependencies
 */
import {
	ResponseCart,
	RequestCart,
	RequestCartProduct,
	CartLocation,
} from './shopping-cart-endpoint';

export * from './shopping-cart-endpoint';

export type ReactStandardAction = { type: string; payload?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface ShoppingCartManagerArguments {
	cartKey: string | number | null;
	canInitializeCart: boolean;
	setCart: ( cartKey: string, arg1: RequestCart ) => Promise< ResponseCart >;
	getCart: ( cartKey: string ) => Promise< ResponseCart >;
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
	responseCart: ResponseCart;
}

export type ReplaceProductInCart = (
	uuidToReplace: string,
	productPropertiesToChange: Partial< RequestCartProduct >
) => void;

export type ReplaceProductsInCart = ( products: RequestCartProduct[] ) => void;

export type AddProductsToCart = ( products: RequestCartProduct[] ) => void;

export type RemoveCouponFromCart = () => void;

export type ApplyCouponToCart = ( couponId: string ) => void;

export type RemoveProductFromCart = ( uuidToRemove: string ) => void;

export type UpdateTaxLocationInCart = ( location: CartLocation ) => void;

/**
 * The custom hook keeps a cached version of the server cart, as well as a
 * cache status.
 *
 *   - 'fresh': Page has loaded and no requests have been sent.
 *   - 'invalid': Local cart data has been edited.
 *   - 'valid': Local cart has been reloaded from the server.
 *   - 'pending': Request has been sent, awaiting response.
 *   - 'error': Something went wrong.
 */
export type CacheStatus = 'fresh' | 'valid' | 'invalid' | 'pending' | 'error';

/**
 * Possible states re. coupon submission.
 *
 *   - 'fresh': User has not (yet) attempted to apply a coupon.
 *   - 'pending': Coupon request has been sent, awaiting response.
 *   - 'applied': Coupon has been applied to the cart.
 *   - 'invalid': Coupon code is not recognized.
 *   - 'rejected': Valid code, but does not apply to the cart items.
 */
export type CouponStatus = 'fresh' | 'pending' | 'applied' | 'invalid' | 'rejected' | 'error';

export type ShoppingCartAction =
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
	| { type: 'RECEIVE_INITIAL_RESPONSE_CART'; initialResponseCart: ResponseCart }
	| { type: 'REQUEST_UPDATED_RESPONSE_CART' }
	| { type: 'RECEIVE_UPDATED_RESPONSE_CART'; updatedResponseCart: ResponseCart }
	| { type: 'RAISE_ERROR'; error: ShoppingCartError; message: string };

export type ShoppingCartError = 'GET_SERVER_CART_ERROR' | 'SET_SERVER_CART_ERROR';

/**
 *     * responseCart
 *         Stored shopping cart endpoint response. We manipulate this
 *         directly and pass it back to the endpoint on update events.
 *     * couponStatus
 *         Used to determine whether to render coupon input fields and
 *         coupon-related error messages.
 *     * cacheStatus
 *         Used to determine whether we need to re-validate the cart on
 *         the backend. We can't use responseCart directly to decide this
 *         in e.g. useEffect because this causes an infinite loop.
 */
export type ShoppingCartState = {
	responseCart: ResponseCart;
	couponStatus: CouponStatus;
	cacheStatus: CacheStatus;
	loadingError?: string;
	loadingErrorType?: ShoppingCartError;
	queuedActions: ShoppingCartAction[];
};
