/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PayButton = require( './pay-button' ),
	CreditCardSelector = require( './credit-card-selector' ),
	TermsOfService = require( './terms-of-service' ),
	PaymentBox = require( './payment-box' ),
	analytics = require( 'lib/analytics' ),
	cartValues = require( 'lib/cart-values' );

import CartCoupon from 'my-sites/upgrades/cart/cart-coupon';

var CreditCardPaymentBox = React.createClass( {
	getInitialState: function() {
		return { previousCart: null };
	},

	handleToggle: function( event ) {
		event.preventDefault();

		analytics.ga.recordEvent( 'Upgrades', 'Clicked Or Use Paypal Link' );
		analytics.tracks.recordEvent( 'calypso_checkout_switch_to_paypal' );
		this.props.onToggle( 'paypal' );
	},

	content: function() {
		var cart = this.props.cart;

		return (
			<form autoComplete="off" onSubmit={ this.props.onSubmit }>
				<CreditCardSelector
					cards={ this.props.cards }
					countriesList={ this.props.countriesList }
					initialCard={ this.props.initialCard }
					transaction={ this.props.transaction } />

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( cart ) } />

				<CartCoupon cart={ cart } />

				<div className="payment-box-actions">
					<PayButton
						cart={ this.props.cart }
						transactionStep={ this.props.transactionStep } />

					{ cartValues.isPayPalExpressEnabled( cart )
						? <a className="credit-card-payment-box__switch-link" href="" onClick={ this.handleToggle }>{ this.translate( 'or use PayPal' ) }</a>
						: null
					}
				</div>
			</form>
		);
	},

	render: function() {
		return (
			<PaymentBox
				classSet="credit-card-payment-box"
				title={ this.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}

} );

module.exports = CreditCardPaymentBox;
