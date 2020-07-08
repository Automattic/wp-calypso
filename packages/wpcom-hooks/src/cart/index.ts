/**
 * External dependencies
 */
import React from 'react';
import WPCOM from 'wpcom';
import apiFetch from '@wordpress/api-fetch';

const wpcom = new WPCOM( undefined, apiFetch );

export interface Cart {
	blog_id: number;
	cart_key: number;
	coupon: string;
	coupon_discounts: unknown[];
	coupon_discounts_integer: number[];
	coupon_discounts_display: unknown[];
	is_coupon_applied: boolean;
	has_bundle_credit: boolean;
	next_domain_is_free: boolean;
	next_domain_condition: string;
	products: unknown[];
	total_cost: number;
	currency: string;
	total_cost_display: string;
	total_cost_integer: number;
	temporary: boolean;
	tax: Tax;
	savings_total: number;
	savings_total_display: string;
	savings_total_integer: number;
	coupon_savings_total: number;
	coupon_savings_total_display: string;
	coupon_savings_total_integer: number;
	sub_total: number;
	sub_total_display: string;
	sub_total_integer: number;
	total_tax: number;
	total_tax_display: string;
	total_tax_integer: number;
	credits: number;
	credits_display: string;
	credits_integer: number;
	allowed_payment_methods: string[];
	create_new_blog: boolean;
	messages: Messages;
}

export interface Messages {
	errors: unknown[];
	success: unknown[];
}

export interface Tax {
	location: unknown[];
	display_taxes: boolean;
}

/**
 * React hook that asynchronously syncs the cart with the server
 * You can use it similar to the way you use useState. e.g [cart, setCart] = useSiteCart(ID).
 * setCart returns a promise that resolves to the server's cart
 *
 * Caveat: it can only be used in a signed in site (eg. in wp-admin).
 *
 * @param siteId the site id
 */
export function useSiteCart(
	siteId: string
): [ Cart | undefined, ( newCart: Cart ) => Promise< Cart > ] {
	const [ cart, setLocalCart ] = React.useState< Cart >();

	// using this allows this hook to re-render every component using it when the cart changes
	function setCartAndNotifySubscribers( newCart: Cart ) {
		// we need to dispatch to window so components using the hook in different React trees
		// still get notified when the cart is updated
		window.dispatchEvent( new CustomEvent( 'wpcom-cart-update', { detail: newCart } ) );
	}

	React.useEffect( () => {
		wpcom
			.sendRequest(
				{
					global: true, // needed when used in wp-admin, otherwise wp-admin will add site-prefix (search for wpcomFetchAddSitePrefix)
					url: `https://public-api.wordpress.com/rest/v1/sites/${ siteId }/shopping-cart`,
					mode: 'cors',
				},
				() => 0 // sendRequest requires a callback even though it returns a promise
			)
			.then( setCartAndNotifySubscribers );
	}, [ siteId ] );

	React.useEffect( () => {
		const handler = ( { detail }: CustomEventInit< Cart > ) => setLocalCart( detail );

		window.addEventListener( 'wpcom-cart-update', handler );

		return () => window.removeEventListener( 'wpcom-cart-update', handler );
	}, [ setLocalCart ] );

	function setCart( newCartHolder: ( ( prevCart?: Cart ) => Cart ) | Cart ) {
		let newCart;

		// accept useState style prevState => newState callback
		if ( typeof newCartHolder === 'function' ) {
			newCart = newCartHolder( cart );
		} else {
			newCart = newCartHolder;
		}

		// optimistically set the cart
		setCartAndNotifySubscribers( newCart );

		// sync with server
		return wpcom
			.sendRequest(
				{
					method: 'POST',
					global: true, // needed when used in wp-admin, otherwise wp-admin will add site-prefix (search for wpcomFetchAddSitePrefix)
					url: `https://public-api.wordpress.com/rest/v1/sites/${ siteId }/shopping-cart`,
					mode: 'cors',
					data: newCart,
				},
				() => 0 // sendRequest requires a callback even though it returns a promise
			)
			.then( ( serverCart: Cart ) => {
				setCartAndNotifySubscribers( serverCart );
				return serverCart;
			} );
	}

	return [ cart, setCart ];
}
