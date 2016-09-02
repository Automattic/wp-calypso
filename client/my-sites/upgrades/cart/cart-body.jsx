/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartItems from './cart-items';
import CartCoupon from './cart-coupon';
import CartTotal from './cart-total';

const CartBody = ( {
	cart,
	collapse,
	selectedSite,
	showCoupon,
	translate
} ) => {
	if ( ! cart.hasLoadedFromServer ) {
		return <div className="cart-body">
			{ translate( 'Loading…', { context: 'Upgrades: Loading cart' } ) }
		</div>;
	}

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
};

CartBody.propTypes = {
	collapse: PropTypes.bool
};

CartBody.defaultProps = {
	collapse: false,
	showCoupon: false
};

export default localize( CartBody );
