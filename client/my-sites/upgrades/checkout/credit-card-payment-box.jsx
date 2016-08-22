/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import CreditCardSelector from './credit-card-selector';
import TermsOfService from './terms-of-service';
import PaymentBox from './payment-box';
import analytics from 'lib/analytics';
import cartValues from 'lib/cart-values';

const CreditCardPaymentBox = React.createClass( {
	getInitialState() {
		return { previousCart: null };
	},

	handleToggle( event ) {
		event.preventDefault();

		analytics.ga.recordEvent( 'Upgrades', 'Clicked Or Use Paypal Link' );
		analytics.tracks.recordEvent( 'calypso_checkout_switch_to_paypal' );
		this.props.onToggle( 'paypal' );
	},

	content() {
		const { cart, cards, countriesList, initialCard, transaction } = this.props;

		return (
			<form onSubmit={ this.props.onSubmit }>
				<CreditCardSelector
					cards={ cards }
					countriesList={ countriesList }
					initialCard={ initialCard }
					transaction={ transaction } />

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( cart ) } />

				<div className="checkout__payment-box-actions">
					<PayButton
						cart={ this.props.cart }
						transactionStep={ this.props.transactionStep } />

					{ cartValues.isPayPalExpressEnabled( cart ) &&
						<a
							className="checkout__credit-card-payment-box__switch-link"
							href=""
							onClick={ this.handleToggle }
						>
							{ this.translate( 'or use PayPal' ) }
						</a>
					}
				</div>
			</form>
		);
	},

	render() {
		const classSet = classNames( {
			'credit-card-payment-box': true,
			selected: this.props.selected === true
		} );

		return (
			<PaymentBox
				classSet={ classSet }
				title={ this.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}

} );

export default CreditCardPaymentBox;
