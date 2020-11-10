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
import CartToggle from './cart-toggle';
import CartCoupon from 'calypso/my-sites/checkout/cart/cart-coupon';
import { hasOnlyProductsOf } from 'calypso/lib/cart-values/cart-items';
import { isBlogger } from 'calypso/lib/products-values';
import CheckoutTerms from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms';

class FreeCartPaymentBox extends React.Component {
	static propTypes = {
		products: PropTypes.object.isRequired,
	};

	content = () => {
		const { cart, onSubmit, translate } = this.props;

		const isUsingDomainCredit = cart.has_bundle_credit && ! hasOnlyProductsOf( cart, 'domain_map' );

		return (
			<React.Fragment>
				<form onSubmit={ onSubmit }>
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<div className="payment-box-section checkout__free-cart-payment-box">
						<div className="checkout__payment-box-section-content">
							{ this.getDomainCreditIllustration() }

							<h6>
								{ isUsingDomainCredit
									? translate( 'You have a free domain credit!' )
									: translate( "Woohoo! You don't owe us anything!" ) }
							</h6>

							<span>
								{ isUsingDomainCredit
									? translate(
											'You get a free domain for one year with your subscription to %(productName)s. Time to celebrate!',
											{ args: { productName: this.getProductName() } }
									  )
									: translate( 'Just complete checkout to add these upgrades to your site.' ) }
							</span>
						</div>
					</div>

					<CheckoutTerms cart={ cart } />

					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<div className="payment-box-actions">
						<PayButton
							cart={ cart }
							transactionStep={ this.props.transactionStep }
							beforeSubmitText={ translate( 'Complete Checkout' ) }
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
			return (
				<span className="checkout__free-stand-alone-domain-mapping-illustration">
					<img src={ '/calypso/images/upgrades/custom-domain.svg' } alt="" />
				</span>
			);
		}

		const isRestrictedToBlogDomains = isBlogger( this.props.selectedSite.plan );

		return (
			<span className="checkout__free-domain-credit-illustration">
				<img
					src={
						isRestrictedToBlogDomains
							? '/calypso/images/illustrations/custom-domain-blogger.svg'
							: '/calypso/images/upgrades/custom-domain.svg'
					}
					alt=""
				/>
			</span>
		);
	};

	render() {
		return (
			<PaymentBox
				classSet="credits-payment-box"
				title={ this.props.translate( 'Secure payment' ) }
				infoMessage={ this.props.infoMessage }
			>
				{ this.content() }
			</PaymentBox>
		);
	}
}

export default localize( FreeCartPaymentBox );
