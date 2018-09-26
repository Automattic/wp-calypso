/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { connect } from 'react-redux';
import { removeCoupon } from '../../../lib/upgrades/actions';
import { recordTracksEvent } from '../../../state/analytics/actions';

/* eslint-disable wpcalypso/jsx-classname-namespace */
class CartTotal extends React.Component {
	render() {
		const { cart, translate } = this.props;

		if ( cart.hasPendingServerUpdates ) {
			return (
				<div className="cart-total">
					{ this.props.translate( 'Recalculating…', {
						context: 'Upgrades: Updating cart cost in checkout',
					} ) }
				</div>
			);
		}

		if ( ! cart.total_cost_display ) {
			return <div className="cart-total" />;
		}

		if ( this.isCouponApplied() ) {
			return (
				<>
					<div className="cart-total">
						<span className="cart-subtotal-label">{ translate( 'Base amount' ) }</span>
						<span className="cart-subtotal-amount">{ cart.total_cost_before_coupon_display }</span>
					</div>
					<div className="cart-total">
						<span className="cart-subtotal-label">
							{ translate( 'Coupon applied: "%(coupon)s"', {
								args: { coupon: this.props.cart.coupon },
							} ) }
						</span>
						<span className="cart-subtotal-amount">- { cart.coupon_discount_display }</span>
						<span className="cart-remove-coupon">
							<button onClick={ this.clearCoupon } className="button is-link cart__remove-link">
								{ translate( 'Remove coupon' ) }
							</button>
						</span>
					</div>
					<div className="cart-total">
						<span className="cart-total-label">{ this.totalLabel() }</span>
						<span className="cart-total-amount">{ cart.total_cost_display }</span>
					</div>
				</>
			);
		}

		return (
			<div className="cart-total">
				<span className="cart-total-label">{ this.totalLabel() }</span>
				<span className="cart-total-amount">{ cart.total_cost_display }</span>
			</div>
		);
	}

	isCouponApplied() {
		const { cart } = this.props;
		const costBeforeCoupon = cart.total_cost_before_coupon_display;
		return (
			cart.is_coupon_applied && costBeforeCoupon && costBeforeCoupon !== cart.total_cost_display
		);
	}

	clearCoupon = event => {
		event.preventDefault();
		this.props.removeCoupon();
	};

	totalLabel = () => {
		const cart = this.props.cart;

		if ( cartItems.hasOnlyFreeTrial( cart ) ) {
			return this.props.translate( 'Total Due Now:', {
				context: 'Upgrades: Total cart cost in checkout when buying a free trial',
			} );
		}
		return this.props.translate( 'Total:', {
			context: 'Upgrades: Total cart cost in checkout when buying a full price upgrade',
		} );
	};
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

const mapDispatchToProps = dispatch => ( {
	removeCoupon: () => {
		dispatch( recordTracksEvent( 'calypso_checkout_coupon_submit', { coupon_code: '' } ) );
		removeCoupon();
	},
} );

export default connect(
	null,
	mapDispatchToProps
)( localize( CartTotal ) );
