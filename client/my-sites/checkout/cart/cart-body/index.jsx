/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import CartItems from 'my-sites/checkout/cart/cart-items';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import CartTotal from 'my-sites/checkout/cart/cart-total';

const CartBody = React.forwardRef( ( props, ref ) => {
	const { cart, selectedSite, collapse = false, showCoupon = false, isWhiteGloveOffer } = props;

	return (
		<div className="cart-body" ref={ ref }>
			<CartItems
				collapse={ collapse }
				cart={ cart }
				selectedSite={ selectedSite }
				isWhiteGloveOffer={ isWhiteGloveOffer }
			/>
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
