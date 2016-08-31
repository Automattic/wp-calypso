/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CartItems from './cart-items';
import CartCoupon from './cart-coupon';
import CartTotal from './cart-total';

class CartBody extends Component {
	static propTypes = {
		collapse: PropTypes.bool
	};

	static defaultProps = {
		collapse: false,
		showCoupon: false
	};

	optionalCoupon() {
		if ( ! this.props.showCoupon ) {
			return;
		}

		return <CartCoupon cart={ this.props.cart } />;
	}

	render() {
		const { translate, cart } = this.props;

		if ( ! cart.hasLoadedFromServer ) {
			return <div className="cart-body">
				{ translate( 'Loading…', { context: 'Upgrades: Loading cart' } ) }
			</div>;
		}

		const { collapse, selectedSite } = this.props;

		return (
			<div className="cart-body">
				<CartItems
					collapse={ collapse }
					cart={ cart }
					selectedSite={ selectedSite } />
				<CartTotal cart={ cart } />
				{ this.optionalCoupon() }
			</div>
		);
	}
}

export default localize( CartBody );
