/**
 * External dependencies
 */

import { find } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { isPlan } from 'calypso/lib/products-values';
import PayButton from './pay-button';
import PaymentBox from './payment-box';
import TermsOfService from 'calypso/my-sites/checkout/composite-checkout/components/terms-of-service';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class FreeTrialConfirmationBox extends React.Component {
	content = () => {
		return (
			<form onSubmit={ this.props.onSubmit }>
				<div className="payment-box-section">
					<div className="checkout__payment-box-section-content">
						<h6>
							{ this.props.translate( 'Get started with %(productName)s', {
								args: { productName: this.getProductName() },
							} ) }
						</h6>

						<span>
							{ this.props.translate(
								'Enjoy your free trial with no strings attached: your site will simply revert to the ' +
									'free plan when the period is over.'
							) }
						</span>
					</div>
				</div>

				<TermsOfService />
				<div className="payment-box-actions">
					<PayButton cart={ this.props.cart } transactionStep={ this.props.transactionStep } />
				</div>
			</form>
		);
	};

	getProductName = () => {
		const planProduct = find( this.props.cart.products, isPlan );

		return ( planProduct && planProduct.product_name ) || '';
	};

	render() {
		return (
			<PaymentBox classSet="credits-payment-box" infoMessage={ this.props.infoMessage }>
				{ this.content() }
			</PaymentBox>
		);
	}
}

export default localize( FreeTrialConfirmationBox );
