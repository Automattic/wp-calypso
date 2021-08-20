import debugFactory from 'debug';
import { useCallback, useMemo, useEffect, useRef } from 'react';
import { convertTempResponseCartToResponseCart } from './cart-functions';
import { createRequestCartProducts } from './create-request-cart-product';
import { createCartSyncMiddleware } from './sync';
import useCartUpdateAndRevalidate from './use-cart-update-and-revalidate';
import useInitializeCartFromServer from './use-initialize-cart-from-server';
import useRefetchOnFocus from './use-refetch-on-focus';
import useShoppingCartReducer from './use-shopping-cart-reducer';
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
	CartValidCallback,
	DispatchAndWaitForValid,
} from './types';

const debug = debugFactory( 'shopping-cart:use-shopping-cart-manager' );

export default function useShoppingCartManager( {
	cartKey,
	setCart,
	getCart,
	options,
}: ShoppingCartManagerArguments ): ShoppingCartManager {
	const setServerCart = useCallback( ( cartParam ) => setCart( String( cartKey ), cartParam ), [
		cartKey,
		setCart,
	] );
	const previousCartKey = useRef< string | number | undefined >();
	const getServerCart = useCallback( () => getCart( String( cartKey ) ), [ cartKey, getCart ] );

	const cartValidCallbacks = useRef< CartValidCallback[] >( [] );

	const syncCartToServer = useMemo( () => createCartSyncMiddleware( setServerCart ), [
		setServerCart,
	] );
	const cartMiddleware = useMemo( () => [ syncCartToServer ], [ syncCartToServer ] );
	const [ hookState, hookDispatch ] = useShoppingCartReducer( cartMiddleware );

	const tempResponseCart: TempResponseCart = hookState.responseCart;
	const couponStatus: CouponStatus = hookState.couponStatus;
	const cacheStatus: CacheStatus = hookState.cacheStatus;
	const loadingError: string | undefined = hookState.loadingError;
	const loadingErrorType: ShoppingCartError | undefined = hookState.loadingErrorType;
	const isMounted = useRef< boolean >( true );

	useEffect( () => {
		return () => {
			isMounted.current = false;
		};
	}, [] );

	useEffect( () => {
		if ( ! cartKey ) {
			return;
		}
		if ( cartKey !== previousCartKey.current ) {
			debug(
				`cart key "${ cartKey }" has changed from "${ previousCartKey.current }"; re-initializing cart`
			);
			isMounted.current && hookDispatch( { type: 'CART_RELOAD' } );
		}
		previousCartKey.current = cartKey;
	}, [ cartKey, hookDispatch ] );

	useInitializeCartFromServer( cacheStatus, cartKey, getServerCart, setServerCart, hookDispatch );

	useCartUpdateAndRevalidate( cacheStatus, hookDispatch );

	const dispatchAndWaitForValid: DispatchAndWaitForValid = useCallback(
		( action ) => {
			debug( 'recevied action', action );
			return new Promise< ResponseCart >( ( resolve ) => {
				isMounted.current && hookDispatch( action );
				cartValidCallbacks.current.push( resolve );
			} );
		},
		[ hookDispatch ]
	);

	const addProductsToCart: AddProductsToCart = useCallback(
		async ( products ) =>
			dispatchAndWaitForValid( {
				type: 'CART_PRODUCTS_ADD',
				products: createRequestCartProducts( products ),
			} ),
		[ dispatchAndWaitForValid ]
	);

	const replaceProductsInCart: ReplaceProductsInCart = useCallback(
		async ( products ) =>
			dispatchAndWaitForValid( {
				type: 'CART_PRODUCTS_REPLACE_ALL',
				products: createRequestCartProducts( products ),
			} ),
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
		() => convertTempResponseCartToResponseCart( tempResponseCart ),
		[ tempResponseCart ]
	);
	const responseCart = useLastValidCart( responseCartWithoutTempProducts, cacheStatus );

	// Refetch when the window is refocused
	useRefetchOnFocus(
		cartKey,
		options ?? {},
		cacheStatus,
		responseCartWithoutTempProducts,
		reloadFromServer
	);

	useEffect( () => {
		if ( cartValidCallbacks.current.length === 0 ) {
			return;
		}
		debug( `cacheStatus changed to ${ cacheStatus } and cartValidCallbacks exist` );
		if ( hookState.queuedActions.length === 0 && cacheStatus === 'valid' ) {
			debug( 'calling cartValidCallbacks' );
			cartValidCallbacks.current.forEach( ( callback ) => callback( responseCart ) );
			cartValidCallbacks.current = [];
		}
	}, [ hookState.queuedActions, cacheStatus, responseCart ] );

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
			responseCart,
		} ),
		[
			responseCart,
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

function useLastValidCart(
	currentResponseCart: ResponseCart,
	cacheStatus: CacheStatus
): ResponseCart {
	const lastValidResponseCart = useRef< ResponseCart >( currentResponseCart );
	if ( cacheStatus === 'valid' ) {
		lastValidResponseCart.current = currentResponseCart;
	}
	return lastValidResponseCart.current;
}
