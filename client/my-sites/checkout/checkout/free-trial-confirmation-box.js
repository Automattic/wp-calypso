/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import PaymentBox from './payment-box';
import TermsOfService from './terms-of-service';
import { isPlan } from 'lib/products-values';

const FreeTrialConfirmationBox = React.createClass( {
	content() {
		return (
		    <form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<h6>
					{
						this.props.translate( 'Get started with %(productName)s', { args: { productName: this.getProductName() } } )
					}
					</h6>

					<span>
					{
						this.props.translate( 'Enjoy your free trial with no strings attached: your site will simply revert to the free plan when the period is over.' )
					}
					</span>
				</div>

				<TermsOfService />
				<div className="payment-box-actions">
					<PayButton
						cart={ this.props.cart }
						transactionStep={ this.props.transactionStep } />
				</div>
			</form>
		);
	},

	getProductName() {
		const planProduct = find( this.props.cart.products, isPlan );

		return ( planProduct && planProduct.product_name ) || '';
	},

	render() {
		return (
			<PaymentBox classSet="credits-payment-box">
				{ this.content() }
			</PaymentBox>
		);
	}
} );

export default localize( FreeTrialConfirmationBox );
