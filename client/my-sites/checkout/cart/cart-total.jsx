/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { shouldShowTax } from 'calypso/lib/cart-values';
import { hasOnlyFreeTrial } from 'calypso/lib/cart-values/cart-items';

class CartTotal extends React.Component {
	static propTypes = {
		cart: PropTypes.shape( {
			tax: PropTypes.shape( {
				location: PropTypes.object.isRequired,
				display_taxes: PropTypes.bool.isRequired,
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

		const showTax = shouldShowTax( cart );
		return (
			<div className="cart__total">
				<div className="cart__total-row grand-total">
					<div className="cart__total-label grand-total">{ this.totalLabel() }</div>
					<div className="cart__total-amount grand-total">{ cart.total_cost_display }</div>
				</div>
				{ showTax && (
					<Fragment>
						<div className="cart__total-row">
							<div className="cart__total-label">Subtotal:</div>
							<div className="cart__total-amount">{ cart.sub_total_display }</div>
						</div>
						<div className="cart__total-row">
							<div className="cart__total-label">Tax:</div>
							<div className="cart__total-amount last-cell">{ cart.total_tax_display }</div>
						</div>
					</Fragment>
				) }
			</div>
		);
	}

	totalLabel = () => {
		const cart = this.props.cart;

		if ( hasOnlyFreeTrial( cart ) ) {
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
