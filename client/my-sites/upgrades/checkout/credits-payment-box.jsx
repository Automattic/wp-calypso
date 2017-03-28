/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PayButton = require( './pay-button' ),
	PaymentBox = require( './payment-box' ),
	TermsOfService = require( './terms-of-service' );

import { abtest } from 'lib/abtest';
import CartCoupon from 'my-sites/upgrades/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import config from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { some } from 'lodash';

var CreditsPaymentBox = React.createClass( {
	content: function() {
		const { cart, transactionStep } = this.props;
		const hasBusinessPlanInCart = some( cart.products, { product_slug: PLAN_BUSINESS } );
		const showPaymentChatButton =
			config.isEnabled( 'upgrades/presale-chat' ) &&
			abtest( 'presaleChatButton' ) === 'showChatButton' &&
			hasBusinessPlanInCart;

		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<h6>{ this.translate( 'WordPress.com Credits' ) }</h6>

					<span>
						{ this.translate( 'You have {{strong}}%(credits)s %(currency)s in Credits{{/strong}} available.',
							{
								args: {
									credits: cart.credits,
									currency: cart.currency
								},
								components: {
									strong: <strong />
								}
							} )
						}
					</span>
				</div>

				<TermsOfService />

				<CartCoupon cart={ cart } />

				<div className="payment-box-actions">
					<PayButton
						cart={ this.props.cart }
						transactionStep={ transactionStep } />
					{
						showPaymentChatButton &&
						<PaymentChatButton
							paymentType="credits"
							cart={ cart }
							transactionStep={ transactionStep } />
					}
				</div>
			</form>
		);
	},

	render: function() {
		return (
			<PaymentBox
				classSet="credits-payment-box"
				title={ this.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}
} );

module.exports = CreditsPaymentBox;
