/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var cartItems = require( 'lib/cart-values' ).cartItems;

class CartTotal extends React.Component {
    render() {
		var cart = this.props.cart;

		if ( cart.hasPendingServerUpdates ) {
			return (
			    <div className="cart-total">
					{ this.props.translate( 'Recalculating…', {
							context: 'Upgrades: Updating cart cost in checkout'
						} ) }
				</div>
			);
		}

		if ( ! cart.total_cost_display ) {
			return <div className="cart-total"></div>;
		}

		return (
			<div className="cart-total">
				<span className="cart-total-label">
					{ this.totalLabel() }
				</span>
				<span className="cart-total-amount">
					{ cart.total_cost_display }
				</span>
			</div>
		);
	}

	totalLabel = () => {
		var cart = this.props.cart;

		if ( cartItems.hasOnlyFreeTrial( cart ) ) {
			return this.props.translate( 'Total Due Now:', {
				context: 'Upgrades: Total cart cost in checkout when buying a free trial'
			} );
		} else {
			return this.props.translate( 'Total:', {
				context: 'Upgrades: Total cart cost in checkout when buying a full price upgrade'
			} );
		}
	};
}

module.exports = localize(CartTotal);
