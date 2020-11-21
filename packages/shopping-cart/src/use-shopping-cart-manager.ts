/**
 * External dependencies
 */
import { useCallback, useMemo, useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import type {
	TempResponseCart,
	ResponseCart,
	RequestCartProduct,
	ShoppingCartManager,
	ShoppingCartManagerArguments,
	CacheStatus,
	CouponStatus,
	ShoppingCartError,
	ReplaceProductInCart,
	ReloadCartFromServer,
	ReplaceProductsInCart,
	AddProductsToCart,
	RemoveCouponFromCart,
	ApplyCouponToCart,
	RemoveProductFromCart,
	UpdateTaxLocationInCart,
} from './types';
import { convertTempResponseCartToResponseCart } from './cart-functions';
import useShoppingCartReducer from './use-shopping-cart-reducer';
import useInitializeCartFromServer from './use-initialize-cart-from-server';
import useCartUpdateAndRevalidate from './use-cart-update-and-revalidate';

const debug = debugFactory( 'shopping-cart:use-shopping-cart-manager' );

export default function useShoppingCartManager( {
	cartKey,
	setCart,
	getCart,
}: ShoppingCartManagerArguments ): ShoppingCartManager {
	const setServerCart = useCallback( ( cartParam ) => setCart( String( cartKey ), cartParam ), [
		cartKey,
		setCart,
	] );
	const previousCartKey = useRef< string | number | undefined >();
	const getServerCart = useCallback( () => getCart( String( cartKey ) ), [ cartKey, getCart ] );

	const cartValidCallback = useRef< undefined | ( () => void ) >();

	const [ hookState, hookDispatch ] = useShoppingCartReducer();

	const responseCart: TempResponseCart = hookState.responseCart;
	const couponStatus: CouponStatus = hookState.couponStatus;
	const cacheStatus: CacheStatus = hookState.cacheStatus;
	const loadingError: string | undefined = hookState.loadingError;
	const loadingErrorType: ShoppingCartError | undefined = hookState.loadingErrorType;

	useEffect( () => {
		if ( ! cartKey ) {
			return;
		}
		if ( cartKey !== previousCartKey.current ) {
			debug(
				`cart key "${ cartKey }" has changed from "${ previousCartKey.current }"; re-initializing cart`
			);
			hookDispatch( { type: 'CART_RELOAD' } );
		}
		previousCartKey.current = cartKey;
	}, [ cartKey, hookDispatch ] );

	useInitializeCartFromServer( cacheStatus, cartKey, getServerCart, setServerCart, hookDispatch );

	// Asynchronously re-validate when the cache is dirty.
	useCartUpdateAndRevalidate( cacheStatus, responseCart, setServerCart, hookDispatch );

	const dispatchAndWaitForValid = useCallback(
		( action ) => {
			return new Promise< void >( ( resolve ) => {
				hookDispatch( action );
				cartValidCallback.current = resolve;
			} );
		},
		[ hookDispatch ]
	);

	const addProductsToCart: AddProductsToCart = useCallback(
		( products ) => dispatchAndWaitForValid( { type: 'CART_PRODUCTS_ADD', products } ),
		[ dispatchAndWaitForValid ]
	);

	const replaceProductsInCart: ReplaceProductsInCart = useCallback(
		( products ) => dispatchAndWaitForValid( { type: 'CART_PRODUCTS_REPLACE_ALL', products } ),
		[ dispatchAndWaitForValid ]
	);

	const removeProductFromCart: RemoveProductFromCart = useCallback(
		( uuidToRemove ) => dispatchAndWaitForValid( { type: 'REMOVE_CART_ITEM', uuidToRemove } ),
		[ dispatchAndWaitForValid ]
	);

	const replaceProductInCart: ReplaceProductInCart = useCallback(
		( uuidToReplace: string, productPropertiesToChange: Partial< RequestCartProduct > ) =>
			dispatchAndWaitForValid( {
				type: 'CART_PRODUCT_REPLACE',
				uuidToReplace,
				productPropertiesToChange,
			} ),
		[ dispatchAndWaitForValid ]
	);

	const updateLocation: UpdateTaxLocationInCart = useCallback(
		( location ) => dispatchAndWaitForValid( { type: 'SET_LOCATION', location } ),
		[ dispatchAndWaitForValid ]
	);

	const applyCoupon: ApplyCouponToCart = useCallback(
		( newCoupon ) => dispatchAndWaitForValid( { type: 'ADD_COUPON', couponToAdd: newCoupon } ),
		[ dispatchAndWaitForValid ]
	);

	const removeCoupon: RemoveCouponFromCart = useCallback(
		() => dispatchAndWaitForValid( { type: 'REMOVE_COUPON' } ),
		[ dispatchAndWaitForValid ]
	);

	const reloadFromServer: ReloadCartFromServer = useCallback(
		() => dispatchAndWaitForValid( { type: 'CART_RELOAD' } ),
		[ dispatchAndWaitForValid ]
	);

	const isLoading = cacheStatus === 'fresh' || cacheStatus === 'fresh-pending' || ! cartKey;
	const loadingErrorForManager = cacheStatus === 'error' ? loadingError : null;
	const isPendingUpdate =
		hookState.queuedActions.length > 0 || cacheStatus !== 'valid' || ! cartKey;

	const responseCartWithoutTempProducts = useMemo(
		() => convertTempResponseCartToResponseCart( responseCart ),
		[ responseCart ]
	);
	const lastValidResponseCart = useRef< ResponseCart >( responseCartWithoutTempProducts );
	if ( cacheStatus === 'valid' ) {
		lastValidResponseCart.current = responseCartWithoutTempProducts;
	}

	useEffect( () => {
		if ( ! cartValidCallback.current ) {
			return;
		}
		debug( `cacheStatus changed to ${ cacheStatus } and cartValidCallback exists` );
		if ( hookState.queuedActions.length === 0 && cacheStatus === 'valid' ) {
			debug( 'calling cartValidCallback' );
			cartValidCallback.current();
			cartValidCallback.current = undefined;
		}
	}, [ hookState.queuedActions, cacheStatus ] );

	const shoppingCartManager = useMemo(
		() => ( {
			isLoading,
			loadingError: loadingErrorForManager,
			loadingErrorType,
			isPendingUpdate,
			addProductsToCart,
			removeProductFromCart,
			applyCoupon,
			removeCoupon,
			couponStatus,
			updateLocation,
			replaceProductInCart,
			replaceProductsInCart,
			reloadFromServer,
			responseCart: lastValidResponseCart.current,
		} ),
		[
			lastValidResponseCart,
			isLoading,
			isPendingUpdate,
			loadingErrorForManager,
			loadingErrorType,
			addProductsToCart,
			removeProductFromCart,
			applyCoupon,
			removeCoupon,
			couponStatus,
			updateLocation,
			replaceProductInCart,
			replaceProductsInCart,
			reloadFromServer,
		]
	);

	useEffect( () => {
		debug( 'shoppingCartManager:', shoppingCartManager );
	}, [ shoppingCartManager ] );

	return shoppingCartManager;
}
