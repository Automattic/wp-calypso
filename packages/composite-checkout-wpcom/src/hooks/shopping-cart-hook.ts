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
	WPCOMCart,
	WPCOMCartItem,
	CheckoutCartItem,
	CheckoutCartItemAmount,
	CheckoutCartTotal,
} from '../types';
import { translateWpcomCartToCheckoutCart } from '../lib/translate-cart';

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
 *     An asynchronous wrapper around the wpcom shopping cart
 *     endpoint. We pass this in to make testing easier.
 * @param getServerCart
 *     Initial request parameter as expected by the cart endpoint
 *     on the backend, passed in from the host page.
 *     @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 * @returns {function()} Custom React hook
 *     To be passed as a prop to the WPCOMCheckout component.
 */
export function makeShoppingCartHook(
	setServerCart: ( RequestCart ) => Promise< ResponseCart >,
	getServerCart: () => Promise< ResponseCart >
): () => ShoppingCartManager {
	return () => {
		// Stored shopping cart endpoint response.
		// We manipulate this directly and pass it back to
		// the endpoint on update events.
		const [ responseCart, setResponseCart ] = useState< ResponseCart | undefined >( undefined );

		// Stored representation of the cart for checkout.
		// The default value is needed because we populate
		// the cart with an async call to the endpoint via
		// translateWpcomCartToCheckoutCart().
		const [ cart, setCart ] = useState< WPCOMCart >( {
			items: <WPCOMCartItem[]>[],
			tax: <CheckoutCartItem>{
				id: 'tax-line-item',
				label: 'Tax',
				type: 'tax',
				amount: <CheckoutCartItemAmount>{
					value: 0,
					currency: '',
					displayValue: '',
				},
			},
			total: <CheckoutCartTotal>{
				label: 'Total',
				amount: <CheckoutCartItemAmount>{
					value: 0,
					currency: '',
					displayValue: '',
				},
			},
			allowedPaymentMethods: [],
		} );

		console.log( 'CART: ', cart );

		// Asynchronously initialize and translate the cart. This
		// only needs to happen once.
		useEffect( () => {
			const fetchAndUpdate = async () => {
				await getServerCart().then( response => {
					console.log( 'INITIAL_CART: ', response );
					setCart( translateWpcomCartToCheckoutCart( response ) );
				} );
			};
			fetchAndUpdate().catch( error => {
				console.log( error );
			} );
		}, [] );

		// Asynchronously get and translate the cart when responseCart changes.
		useEffect( () => {
			const fetchAndUpdate = async () => {
				if ( typeof responseCart !== 'undefined' ) {
					await setServerCart( prepareRequestCart( responseCart ) ).then( response => {
						setCart( translateWpcomCartToCheckoutCart( response ) );
					} );
				}
			};
			fetchAndUpdate().catch( error => {
				console.log( error );
			} );
		}, [ responseCart ] );

		const addItem = item => {
			alert( 'addItem: ' + item );
			setResponseCart( responseCart );
		};

		const deleteItem = itemToDelete => {
			if ( typeof responseCart !== 'undefined' ) {
				const filteredProducts = responseCart.products.filter( ( _, index ) => {
					return index !== itemToDelete.wpcom_meta.uuid;
				} );
				setResponseCart( { ...responseCart, products: filteredProducts } );
			}
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

		return <ShoppingCartManager>{
			items: cart.items,
			tax: cart.tax,
			total: cart.total,
			addItem,
			deleteItem,
			changePlanLength,
			updatePricesForAddress,
		};
	};
}

export interface ShoppingCartManager {
	items: WPCOMCartItem[];
	tax: CheckoutCartItem;
	total: CheckoutCartTotal;
	addItem: ( WPCOMCartItem ) => void;
	deleteItem: ( WPCOMCartItem ) => void;
}
