/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';

import PaymentBox from './payment-box';
import TermsOfService from './terms-of-service';

import CartToggle from './cart-toggle';

const FreeCartPaymentBox = React.createClass( {
	propTypes: {
		products: React.PropTypes.object.isRequired
	},

	content: function() {
		const cart = this.props.cart;

		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<h6>{
						cart.has_bundle_credit ?
							this.translate( 'You have a free domain credit!' ) :
							this.translate( "Woohoo! You don't owe us anything!" ) }
					</h6>

					<span>{
						cart.has_bundle_credit ?
							this.translate( 'You get one free domain with your subscription to %(productName)s. Time to celebrate!', { args: { productName: this.getProductName() } } ) :
							this.translate( 'Just complete checkout to add these upgrades to your site.' ) }
					</span>
				</div>

				<TermsOfService />

				<CartToggle />

				<div className="payment-box-actions">
					<PayButton
						cart={ cart }
						transactionStep={ this.props.transactionStep }
						beforeSubmitText={ this.translate( 'Complete Checkout' ) } />
				</div>
			</form>
		);
	},

	getProductName: function() {
		let cart = this.props.cart,
			product;

		if ( cart.has_bundle_credit && this.props.selectedSite.plan ) {
			product = this.props.products[ this.props.selectedSite.plan.product_slug ];
		}

		if ( product ) {
			return product.product_name;
		} else {
			return '';
		}
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

module.exports = FreeCartPaymentBox;
