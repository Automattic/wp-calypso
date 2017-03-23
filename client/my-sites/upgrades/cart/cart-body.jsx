/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import CartItems from './cart-items';
import CartCoupon from './cart-coupon';
import CartTotal from './cart-total';

const CartBody = (
    {
        cart,
        collapse,
        selectedSite,
        showCoupon,
    }
) => {
    return (
        <div className="cart-body">
            <CartItems collapse={collapse} cart={cart} selectedSite={selectedSite} />
            <CartTotal cart={cart} />
            {showCoupon && <CartCoupon cart={cart} />}
        </div>
    );
};

CartBody.propTypes = {
    collapse: PropTypes.bool,
};

CartBody.defaultProps = {
    collapse: false,
    showCoupon: false,
};

export default CartBody;
