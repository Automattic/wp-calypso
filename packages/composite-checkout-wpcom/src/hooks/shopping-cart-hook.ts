/**
 * External dependencies
 */
import { useState, useEffect } from 'react';

/**
 * Internal dependencies
 */
import {
	prepareRequestCart,
	ResponseCart,
    emptyResponseCart,
	WPCOMCart,
	WPCOMCartItem,
	CheckoutCartItem,
	CheckoutCartTotal,
} from '../types';
import { translateWpcomCartToCheckoutCart } from '../lib/translate-cart';

/**
 * This module provides a hook for manipulating the shopping cart state,
 * bundled into a ShoppingCartManager object. All of the details of
 * validation and pricing are handled by the backend, and the details of
 * communicating with the backend are handled inside the hook. The interface
 * exposed by the hook consists of the following:
 *
 *     * items: the array of items currently in the cart
 *     * tax: the tax line item
 *     * total: the total price line item
 *     * addItem: callback for adding an item to the cart
 *     * deleteItem: callback for removing an item from the cart
 */
export interface ShoppingCartManager {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem;
	total: CheckoutCartTotal;
	addItem: ( WPCOMCartItem ) => void;
	removeItem: ( WPCOMCartItem ) => void;
}

/**
 * The custom hook keeps a cached version of the server cart, as well as a
 * "boolean" representing whether the cache has been invalidated. We set this
 * to 'invalid' when the cache is edited and back to 'valid' after reloading
 * the cart from the server.
 */
type CacheStatus = 'valid' | 'invalid';

/**
 * Custom hook for managing state in the WPCOM checkout component.
 *
 * We need to allow users to make some simple changes to their
 * shopping cart during checkout; things like deleting items,
 * changing plan lengths, and removing domains. The rules around
 * how these changes can be made are complex and already implemented
 * on the backend via the shopping cart endpoint. So rather than
 * duplicate that logic here we let the server do it for us.
 *
 * The flow goes like this:
 *     1. The host page renders checkout as a component with
 *       this custom hook as a prop, after 'instantiating' it
 *       with REST callback wrappers.
 *     2. This hook maintains a copy of the latest endpoint response
 *       and updates it directly on edit events in checkout.
 *     3. When the cached response cart changes, we fetch an updated
 *       cart from the server and translate it into the format
 *       required by the checkout component. This data is otherwise
 *       not changed.
 *
 * @param setServerCart
 *     An asynchronous wrapper around the wpcom shopping cart POST
 *     endpoint. We pass this in to make testing easier.
 *     @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 * @param getServerCart
 *     An asynchronous wrapper around the wpcom shopping cart GET
 *     endpoint. We pass this in to make testing easier.
 *     @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 * @returns
 *     A hook () => ShoppingCartManager to be passed as a prop to
 *     WPCOMCheckout, where it should be called exactly once per render.
 */
export function makeShoppingCartHook(
	setServerCart: ( RequestCart ) => Promise< ResponseCart >,
	getServerCart: () => Promise< ResponseCart >
): () => ShoppingCartManager {
	return () => {
		// Stored shopping cart endpoint response. We manipulate this
		// directly and pass it back to the endpoint on update events.
		// Note that on the first render this state is undefined
		// since we have to get the initial cart response asynchronously.
		const [ responseCart, setResponseCart ] = useState< ResponseCart >( emptyResponseCart );

		// Used to determine whether we need to re-validate the cart on
		// the backend. We can't use responseCart directly to decide this
		// in e.g. useEffect because this causes an infinite loop.
		const [ cacheStatus, setCacheStatus ] = useState< CacheStatus >( 'invalid' );

		// Asynchronously initialize the cart. This should happen exactly once.
		useEffect( () => {
			const initializeResponseCart = async () => {
				const response = await getServerCart();
				setResponseCart( response );
				setCacheStatus( 'valid' );
			};
			initializeResponseCart().catch( error => {
				// TODO: figure out what to do here
				alert( error );
			} );
		}, [] );

		// Asynchronously re-validate when the cache is dirty.
		useEffect( () => {
			const fetchAndUpdate = async () => {
				if ( cacheStatus === 'invalid' ) {
					const response = await setServerCart( prepareRequestCart( responseCart ) );
					setResponseCart( response );
					setCacheStatus( 'valid' );
				}
			};
			fetchAndUpdate().catch( error => {
				// TODO: figure out what to do here
				alert( error );
			} );
		}, [ cacheStatus, responseCart ] );

		// Translate the responseCart into the format needed in checkout.
		const cart: WPCOMCart = translateWpcomCartToCheckoutCart( responseCart );

		const addItem: ( WPCOMCartItem ) => void = itemToAdd => {
			alert( 'addItem: ' + itemToAdd );
			setCacheStatus( 'invalid' );
			setResponseCart( responseCart );
		};

		const removeItem: ( WPCOMCartItem ) => void = itemToRemove => {
			const filteredProducts = responseCart.products.filter( ( _, index ) => {
				return index !== itemToRemove.wpcom_meta.uuid;
			} );
			setCacheStatus( 'invalid' );
			setResponseCart( { ...responseCart, products: filteredProducts } );
		};

		const changePlanLength = ( planItem, planLength ) => {
			// TODO
			alert( 'changePlanLength: ' + planLength + planItem );
			setResponseCart( responseCart );
		};

		const updatePricesForAddress = address => {
			// TODO
			alert( 'updatePricesForAddress: ' + address );
			setResponseCart( responseCart );
		};

		return {
			items: cart.items,
			tax: cart.tax,
			total: cart.total,
			addItem,
			removeItem,
			changePlanLength,
			updatePricesForAddress,
		} as ShoppingCartManager;
	};
}
