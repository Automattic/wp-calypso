import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import CartItems from 'calypso/my-sites/checkout/cart/cart-items';
import CartTotal from 'calypso/my-sites/checkout/cart/cart-total';

const CartBody = forwardRef( ( props, ref ) => {
	const { cart, selectedSite, collapse = false } = props;

	return (
		<div className="cart-body" ref={ ref }>
			<CartItems collapse={ collapse } cart={ cart } selectedSite={ selectedSite } />
			<CartTotal cart={ cart } />
		</div>
	);
} );

CartBody.propTypes = {
	cart: PropTypes.object,
	selectedSite: PropTypes.object,
	collapse: PropTypes.bool,
};

export default CartBody;
