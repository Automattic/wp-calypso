/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import PaymentBox from './payment-box';
import TermsOfService from './terms-of-service';
import CartToggle from './cart-toggle';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';

class FreeCartPaymentBox extends React.Component {
	static propTypes = {
		products: PropTypes.object.isRequired,
	};

	content = () => {
		const cart = this.props.cart;

		return (
			<React.Fragment>
				<form onSubmit={ this.props.onSubmit }>
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<div className="payment-box-section">
						<div className="checkout__payment-box-section-content">
							<h6>
								{ cart.has_bundle_credit
									? this.props.translate( 'You have a free domain credit!' )
									: this.props.translate( "Woohoo! You don't owe us anything!" ) }
							</h6>

							<span>
								{ cart.has_bundle_credit
									? this.props.translate(
											'You get one free domain with your subscription to %(productName)s. Time to celebrate!',
											{ args: { productName: this.getProductName() } }
									  )
									: this.props.translate(
											'Just complete checkout to add these upgrades to your site.'
									  ) }
							</span>
						</div>
					</div>

					<TermsOfService />

					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<div className="payment-box-actions">
						<PayButton
							cart={ cart }
							transactionStep={ this.props.transactionStep }
							beforeSubmitText={ this.props.translate( 'Complete Checkout' ) }
						/>
					</div>
				</form>
				<CartCoupon cart={ cart } />
				<CartToggle />
			</React.Fragment>
		);
	};

	getProductName = () => {
		let cart = this.props.cart,
			product;

		if ( cart.has_bundle_credit && this.props.selectedSite.plan ) {
			product = this.props.products[ this.props.selectedSite.plan.product_slug ];
		}

		if ( product ) {
			return product.product_name;
		}
		return '';
	};

	render() {
		return (
			<PaymentBox classSet="credits-payment-box" title={ this.props.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}
}

export default localize( FreeCartPaymentBox );
