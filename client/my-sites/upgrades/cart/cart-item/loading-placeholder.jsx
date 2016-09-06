/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const CartItemLoadingPlaceholder = () => (
	<div className="cart-item__loading-placeholder cart-item">
		<div className="primary-details">
			<span className="product-name"></span>
			<span className="product-domain"></span>
		</div>
		<div className="secondary-details">
			<span className="product-price"></span>
			<Button className="cart-item__loading-placeholder-remove-item remove-item" />
		</div>
	</div>
);

export default CartItemLoadingPlaceholder;
