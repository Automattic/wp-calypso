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

class CartTotal extends React.Component {
	render() {
		const cart = this.props.cart;

		if ( cart.hasPendingServerUpdates ) {
			return (
				<div className="cart__total">
					{ this.props.translate( 'Recalculating…', {
						context: 'Upgrades: Updating cart cost in checkout',
					} ) }
				</div>
			);
		}

		if ( ! cart.total_cost_display ) {
			return <div className="cart__total" />;
		}

		return (
			<div className="cart__total">
				<span className="cart__total-label">{ this.totalLabel() }</span>
				<span className="cart__total-amount">{ cart.total_cost_display }</span>
			</div>
		);
	}

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

export default localize( CartTotal );
