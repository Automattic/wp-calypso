/**
 * External dependencies
 */
import { useState, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { translateWpcomCartToCheckoutCart } from '../lib/translate-cart';

/**
 * Custom hook for managing state in the WPCOM checkout component.
 *
 * We need to allow users to make some simple changes to their
 * shopping cart during checkout; things like deleting items,
 * changing plan lengths, and removing domains. The rules around
 * how these changes can be made is complex and already implemented
 * on the backend via the shopping cart endpoint. So rather than
 * duplicate that logic here we let the server do it for us.
 *
 * The flow goes like this:
 *     1. The host page renders checkout as a component with
 *       this custom hook as a prop, after 'instantiating' it
 *       with a REST callback wrapper and the initial cart data.
 *     2. This hook maintains a copy of the request parameter
 *       and updates it in response to edit events in checkout.
 *     3. When the request parameter changes, we fetch an updated
 *       cart from the server and translate it into the format
 *       required by the checkout component. This data is otherwise
 *       not changed.
 *
 * @param {function()} callWpcomShoppingCartEndpoint
 *     An asynchronous wrapper around the wpcom shopping cart
 *     endpoint. We pass this in to make testing easier.
 * @param {object} initialRequest
 *     Initial request parameter as expected by the cart endpoint
 *     on the backend, passed in from the host page.
 *     @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 * @returns {function()} Custom React hook
 *     To be passed as a prop to the WPCOMCheckout component.
 */
export function makeShoppingCartHook( callWpcomShoppingCartEndpoint, initialRequest ) {
	return () => {
		// Stored shopping cart endpoint request parameter.
		// We manipulate this directly and pass it back to
		// the endpoint on update events.
		const [ requestParam, setRequestParam ] = useState( initialRequest );

		// Stored representation of the cart for checkout.
		// The default value is needed because we populate
		// the cart with an async call to the endpoint via
		// translateWpcomCartToCheckoutCart().
		const [ cart, setCart ] = useState( {
			items: [],
			tax: {
				id: 'tax-line-item',
				label: 'Tax',
				type: 'tax',
				amount: { value: 0, currency: '', displayValue: '' },
			},
			total: { value: 0, currency: '', displayValue: '' },
			allowedPaymentMethods: [],
		} );

		// Asynchronously get and translate the cart when
		// requestParam changes.
		useEffect( () => {
			const fetchAndUpdate = async () => {
				await callWpcomShoppingCartEndpoint( requestParam ).then( response => {
					setCart( translateWpcomCartToCheckoutCart( response ) );
				} );
			};
			fetchAndUpdate();
		}, [ requestParam ] );

		const addItem = item => {
			alert( 'addItem: ' + item );
			setRequestParam( requestParam );
		};

		const deleteItem = itemToDelete => {
			const filteredProducts = requestParam.products.filter( ( item, index ) => {
				return index !== itemToDelete.wpcom_meta.uuid;
			} );
			setRequestParam( { ...requestParam, products: filteredProducts } );
		};

		const changePlanLength = ( planItem, planLength ) => {
			// TODO
			alert( 'changePlanLength: ' + planLength + planItem );
			setRequestParam( requestParam );
		};

		const updatePricesForAddress = address => {
			// TODO
			alert( 'updatePricesForAddress: ' + address );
			setRequestParam( requestParam );
		};

		return {
			items: cart.items,
			itemsWithTax: [ ...cart.items, cart.tax ],
			total: { label: 'Total', amount: cart.total },
			addItem,
			deleteItem,
			changePlanLength,
			updatePricesForAddress,
		};
	};
}
