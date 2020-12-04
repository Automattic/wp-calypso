/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CartItems from 'calypso/my-sites/checkout/cart/cart-items';
import CartCoupon from 'calypso/my-sites/checkout/cart/cart-coupon';
import CartTotal from 'calypso/my-sites/checkout/cart/cart-total';

const CartBody = React.forwardRef( ( props, ref ) => {
	const { cart, selectedSite, collapse = false, showCoupon = false } = props;

	return (
		<div className="cart-body" ref={ ref }>
			<CartItems collapse={ collapse } cart={ cart } selectedSite={ selectedSite } />
			<CartTotal cart={ cart } />
			{ showCoupon && <CartCoupon cart={ cart } /> }
		</div>
	);
} );

CartBody.propTypes = {
	cart: PropTypes.object,
	selectedSite: PropTypes.object,
	collapse: PropTypes.bool,
	showCoupon: PropTypes.bool,
};

export default CartBody;
