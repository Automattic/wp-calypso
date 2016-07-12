/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import PaymentBox from './payment-box';
import TermsOfService from './terms-of-service';

const CreditsPaymentBox = React.createClass( {
	content() {
		const { cart, onSubmit, transactionStep } = this.props;

		return (
			<form onSubmit={ onSubmit }>
				<div className="checkout__payment-box-section">
					<h6>{ this.translate( 'WordPress.com Credits' ) }</h6>

					<span>
						{ this.translate( 'You have {{strong}}%(credits)s %(currency)s in Credits{{/strong}} available.', {
							args: {
								credits: cart.credits,
								currency: cart.currency
							},
							components: {
								strong: <strong />
							}
						} ) }
					</span>
				</div>

				<TermsOfService />

				<div className="checkout__payment-box-actions">
					<PayButton
						cart={ cart }
						transactionStep={ transactionStep } />
				</div>
			</form>
		);
	},

	render() {
		const classSet = classNames( {
			'credits-payment-box': true,
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

export default CreditsPaymentBox;
