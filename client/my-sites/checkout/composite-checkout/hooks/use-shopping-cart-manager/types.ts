/**
 * Internal dependencies
 */
import {
	ResponseCart,
	RequestCart,
	RequestCartProduct,
	CartLocation,
} from '../../types/backend/shopping-cart-endpoint';

export type ReactStandardAction = { type: string; payload?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface ShoppingCartManagerArguments {
	cartKey: string | number | null;
	canInitializeCart: boolean;
	productsToAddOnInitialize: RequestCartProduct[] | null;
	couponToAddOnInitialize: string | null;
	setCart: ( cartKey: string, arg1: RequestCart ) => Promise< ResponseCart >;
	getCart: ( cartKey: string ) => Promise< ResponseCart >;
}

export interface VariantSelectOverride {
	uuid: string;
	overrideSelectedProductSlug: string;
}

export interface ShoppingCartManager {
	isLoading: boolean;
	loadingError: string | null | undefined;
	isPendingUpdate: boolean;
	addItem: ( arg0: RequestCartProduct ) => void;
	removeItem: ( arg0: string ) => void;
	submitCoupon: ( arg0: string ) => void;
	removeCoupon: () => void;
	couponStatus: CouponStatus;
	updateLocation: ( arg0: CartLocation ) => void;
	variantRequestStatus: VariantRequestStatus;
	variantSelectOverride: VariantSelectOverride[];
	changeItemVariant: (
		uuidToReplace: string,
		newProductSlug: string,
		newProductId: number
	) => void;
	responseCart: ResponseCart;
}

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
 * Possible states re. variant selection. Note that all variant
 * change requests share the same state; this means if there is more
 * than one item in the cart with variant options they will all be in
 * pending state at the same time. Right now this is moot because at most
 * one cart item (the plan, if it exists) can have a variant picker.
 * If later we want to allow variations on more than one cart item
 * It should be straightforward to adjust the type of ShoppingCartManager
 * to accommodate this. For now the extra complexity is not worth it.
 */
export type VariantRequestStatus = 'fresh' | 'pending' | 'valid' | 'error';

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
	| { type: 'ADD_CART_ITEM'; requestCartProductToAdd: RequestCartProduct }
	| { type: 'SET_LOCATION'; location: CartLocation }
	| {
			type: 'REPLACE_CART_ITEM';
			uuidToReplace: string;
			newProductId: number;
			newProductSlug: string;
	  }
	| { type: 'CLEAR_VARIANT_SELECT_OVERRIDE' }
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
 *     * variantRequestStatus
 *         Used to allow updating the view immediately upon a variant
 *         change request.
 */
export type ShoppingCartState = {
	responseCart: ResponseCart;
	couponStatus: CouponStatus;
	cacheStatus: CacheStatus;
	loadingError?: string;
	loadingErrorType?: ShoppingCartError;
	variantRequestStatus: VariantRequestStatus;
	variantSelectOverride: { uuid: string; overrideSelectedProductSlug: string }[];
	queuedActions: ShoppingCartAction[];
};
