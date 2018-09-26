/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import PaymentLogo from 'components/payment-logo';
import { getEnabledPaymentMethods } from 'lib/cart-values';

class PaymentMethods extends Component {
	renderPaymentMethods = methods => {
		const methodsLogos = methods.map( method => {
			if ( method === 'credit-card' ) {
				return (
					<div key={ method } className="payment-methods__cc-logos">
						<PaymentLogo type="mastercard" altText="Mastercard" />
						<PaymentLogo type="visa" altText="Visa" />
						<PaymentLogo type="amex" altText="Amex" />
						<PaymentLogo type="discover" altText="Discover" />
					</div>
				);
			}

			return <PaymentLogo type={ method } key={ method } altText={ method } />;
		} );

		return <div className="payment-methods__methods">{ methodsLogos }</div>;
	};

	render() {
		const { translate } = this.props;
		if ( ! this.props.cart.hasLoadedFromServer ) {
			return false;
		}

		return (
			<div className="payment-methods">
				<Gridicon
					icon="lock"
					size={ 18 }
					aria-label={ translate( 'Lock icon' ) }
					className="payment-methods__icon"
				/>
				{ translate( 'Secure payment using:', {
					comment: 'Followed by a graphical list of payment methods available to the user',
				} ) }

				{ this.renderPaymentMethods( getEnabledPaymentMethods( this.props.cart ) ) }
			</div>
		);
	}
}

export default localize( PaymentMethods );
