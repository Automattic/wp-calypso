/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CartItemLoadingPlaceholder from 'my-sites/upgrades/cart/cart-item/loading-placeholder';

const CartBodyLoadingPlaceholder = () => (
	<div className="cart-body__loading-placeholder cart-body">
		<ul className="cart-items">
			<CartItemLoadingPlaceholder />
			<CartItemLoadingPlaceholder />
		</ul>
	</div>
);

export default CartBodyLoadingPlaceholder;
