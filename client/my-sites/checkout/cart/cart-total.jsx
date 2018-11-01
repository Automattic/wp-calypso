/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';

class CartTotal extends React.Component {
	static propTypes = {
		cart: PropTypes.shape( {
			tax: PropTypes.shape( {
				location: PropTypes.object.isRequired,
				display_tax: PropTypes.bool.isRequired,
			} ).isRequired,
			sub_total: PropTypes.number.isRequired,
			sub_total_display: PropTypes.string.isRequired,
			total_tax: PropTypes.number.isRequired,
			total_tax_display: PropTypes.string.isRequired,
		} ).isRequired,
	};

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
