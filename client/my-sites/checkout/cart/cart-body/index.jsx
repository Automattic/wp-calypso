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

class CartBody extends React.PureComponent {
	constructor( props ) {
		super( props );
	}

	render() {
		const { cart, collapse, selectedSite, showCoupon } = this.props;

		return (
			<div className="cart-body">
				<CartItems
					collapse={ collapse }
					cart={ cart }
					selectedSite={ selectedSite } />
				<CartTotal cart={ cart } />
				{ showCoupon && <CartCoupon cart={ cart } /> }
			</div>
		);
	}
}

CartBody.propTypes = {
	collapse: PropTypes.bool
};

CartBody.defaultProps = {
	collapse: false,
	showCoupon: false
};

export default CartBody;
