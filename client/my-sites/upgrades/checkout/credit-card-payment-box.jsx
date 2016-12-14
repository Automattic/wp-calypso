/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

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
import PaymentChatButton from './payment-chat-button';
import config from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { some } from 'lodash';

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

		const hasBusinessPlanInCart = some( cart.products, { product_slug: PLAN_BUSINESS } );
		const showPaymentChatButton =
			config.isEnabled( 'upgrades/presale-chat' ) &&
			hasBusinessPlanInCart;

		const paypalButtonClasses = classnames( 'credit-card-payment-box__switch-link', {
			'credit-card-payment-box__switch-link-left': showPaymentChatButton
		} );

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
						? <a className={ paypalButtonClasses } href="" onClick={ this.handleToggle }>{ this.translate( 'or use PayPal' ) }</a>
						: null
					}

					{
						showPaymentChatButton &&
						<PaymentChatButton
							paymentType="credits"
							cart={ this.props.cart }
							transactionStep={ this.props.transactionStep } />
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
