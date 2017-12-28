/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';

const CartItemLoadingPlaceholder = () => (
	<div className="cart-item__loading-placeholder cart-item">
		<div className="primary-details">
			<span className="product-name" />
			<span className="product-domain" />
		</div>
		<div className="secondary-details">
			<span className="product-price" />
			<Button className="cart-item__loading-placeholder-remove-item remove-item" />
		</div>
	</div>
);

export default CartItemLoadingPlaceholder;
