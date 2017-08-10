var PropTypes = require('prop-types');
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

import CartToggle from './cart-toggle';

import { localize } from 'i18n-calypso';

class FreeCartPaymentBox extends React.Component {
    static propTypes = {
		products: PropTypes.object.isRequired
	};

	content = () => {
		var cart = this.props.cart;

		return (
		    <form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<h6>{
						cart.has_bundle_credit ?
							this.props.translate( 'You have a free domain credit!' ) :
							this.props.translate( "Woohoo! You don't owe us anything!" ) }
					</h6>

					<span>{
						cart.has_bundle_credit ?
							this.props.translate( 'You get one free domain with your subscription to %(productName)s. Time to celebrate!', { args: { productName: this.getProductName() } } ) :
							this.props.translate( 'Just complete checkout to add these upgrades to your site.' ) }
					</span>
				</div>

				<TermsOfService />

				<CartToggle />

				<div className="payment-box-actions">
					<PayButton
						cart={ cart }
						transactionStep={ this.props.transactionStep }
						beforeSubmitText={ this.props.translate( 'Complete Checkout' ) } />
				</div>
			</form>
		);
	};

	getProductName = () => {
		var cart = this.props.cart,
			product;

		if ( cart.has_bundle_credit && this.props.selectedSite.plan ) {
			product = this.props.products[ this.props.selectedSite.plan.product_slug ];
		}

		if ( product ) {
			return product.product_name;
		} else {
			return '';
		}
	};

	render() {
		return (
		    <PaymentBox
				classSet="credits-payment-box"
				title={ this.props.translate( 'Secure Payment' ) }>
				{ this.content() }
			</PaymentBox>
		);
	}
}

module.exports = localize(FreeCartPaymentBox);
