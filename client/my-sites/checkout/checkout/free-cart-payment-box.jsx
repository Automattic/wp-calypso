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
							{ this.getDomainCreditIllustration() }

							<h6>
								{ cart.has_bundle_credit
									? this.props.translate( 'You have a free domain credit!' )
									: this.props.translate( "Woohoo! You don't owe us anything!" ) }
							</h6>

							<span>
								{ cart.has_bundle_credit
									? this.props.translate(
											'You get a free domain for one year with your subscription to %(productName)s. Time to celebrate!',
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
		const cart = this.props.cart;
		let product;

		if ( cart.has_bundle_credit && this.props.selectedSite.plan ) {
			product = this.props.products[ this.props.selectedSite.plan.product_slug ];
		}

		return product ? product.product_name : '';
	};

	getDomainCreditIllustration = () => {
		const cart = this.props.cart;

		if ( ! cart.has_bundle_credit ) {
			return;
		}

		return (
			<span className="checkout__free-domain-credit-illustration">
				<img src="/calypso/images/illustrations/custom-domain.svg" alt="" />
			</span>
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

export default localize( FreeCartPaymentBox );
