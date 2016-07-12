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

const FreeCartPaymentBox = React.createClass( {
	propTypes: {
		products: React.PropTypes.object.isRequired
	},

	content() {
		const { cart, onSubmit, transactionStep } = this.props;

		return (
			<form onSubmit={ onSubmit }>
				<div className="checkout__payment-box-section">
					<h6>
						{
							cart.has_bundle_credit
							? this.translate( 'You have a free domain credit!' )
							: this.translate( "Woohoo! You don't owe us anything!" )
						}
					</h6>

					<span>
						{
							cart.has_bundle_credit
							? this.translate(
								'You get one free domain with your subscription to %(productName)s. Time to celebrate!', {
									args: {
										productName: this.getProductName()
									}
								} )
							: this.translate( 'Just complete checkout to add these upgrades to your site.' ) }
					</span>
				</div>

				<TermsOfService />

				<div className="checkout__payment-box-actions">
					<PayButton
						cart={ cart }
						transactionStep={ transactionStep }
						beforeSubmitText={ this.translate( 'Complete Checkout' ) } />
				</div>
			</form>
		);
	},

	getProductName: function() {
		const { cart } = this.props;
		let product;

		if ( cart.has_bundle_credit && this.props.selectedSite.plan ) {
			product = this.props.products[ this.props.selectedSite.plan.product_slug ];
		}

		if ( product ) {
			return product.product_name;
		}

		return '';
	},

	render: function() {
		const classSet = classNames( {
			'credits-payment-box': true,
			selected: this.props.selected
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

export default FreeCartPaymentBox;
