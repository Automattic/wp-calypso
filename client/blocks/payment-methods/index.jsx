/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PaymentLogo from 'components/payment-logo';
import { getCurrentUserPaymentMethods } from 'state/selectors';

class PaymentMethods extends Component {

	renderPaymentMethods = methods => {
		const methodsLogos = methods.map( method => {
			if ( method === 'credit-card' ) {
				return (
					<div key={ method } className="payment-methods__cc-logos">
						<PaymentLogo type="mastercard" />
						<PaymentLogo type="visa" />
						<PaymentLogo type="amex" />
						<PaymentLogo type="discover" />
					</div>
				);
			}

			return <PaymentLogo type={ method } key={ method } />;
		} );

		return (
			<div className="payment_methods__methods">
				{ methodsLogos }
			</div>
		);
	};

	render() {
		return (
			<Card className="payment-methods">
					<Gridicon icon='lock' size={ 18 } />
					{ this.props.translate( 'Secure payment using:', {
						comment: 'Followed by a graphical list of payment methods available to the user'
					} ) }
					{ this.renderPaymentMethods( this.props.paymentMethods ) }
			</Card>
		);
	}
}

export default connect( state => {
	return {
		paymentMethods: getCurrentUserPaymentMethods( state ),
	};
} )( localize( PaymentMethods ) );
