/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import PaymentBox from './payment-box';
import TermsOfService from './terms-of-service';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import CartToggle from './cart-toggle';

class CreditsPaymentBox extends React.Component {
	content = () => {
		const { cart, transactionStep, presaleChatAvailable } = this.props;
		const hasBusinessPlanInCart = some( cart.products, { product_slug: PLAN_BUSINESS } );
		const showPaymentChatButton = presaleChatAvailable && hasBusinessPlanInCart;

		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<div className="checkout__payment-box-section-content">
						<h6>{ this.props.translate( 'WordPress.com Credits' ) }</h6>

						<span>
							{ this.props.translate(
								'You have {{strong}}%(credits)s %(currency)s in Credits{{/strong}} available.',
								{
									args: {
										credits: cart.credits,
										currency: cart.currency,
									},
									components: {
										strong: <strong />,
									},
								}
							) }
						</span>
					</div>
				</div>

				<TermsOfService />

				<div className="payment-box-actions">
					<PayButton cart={ this.props.cart } transactionStep={ transactionStep } />
					{ showPaymentChatButton && (
						<PaymentChatButton
							paymentType="credits"
							cart={ cart }
							transactionStep={ transactionStep }
						/>
					) }
				</div>

				<CartCoupon cart={ cart } />

				<CartToggle />
			</form>
		);
	};

	render() {
		return (
			<PaymentBox classSet="credits-payment-box" title={ this.props.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}
}

export default localize( CreditsPaymentBox );
