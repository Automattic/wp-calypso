/**
 * External dependencies
 */
import React from 'react';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal Dependencies
 */
import CartMessages from 'calypso/my-sites/checkout/cart/cart-messages';

export function CalypsoShoppingCartMessages(): JSX.Element {
	const { responseCart, isLoading } = useShoppingCart();
	return <CartMessages cart={ responseCart } isLoadingCart={ isLoading } />;
}
