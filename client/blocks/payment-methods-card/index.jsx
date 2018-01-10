/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import PaymentLogo from 'components/payment-logo';
import { getCurrentUserPaymentMethods } from 'state/selectors';

class PaymentMethodsCard extends Component {
	renderPaymentMethods = methods => {
		const methodsLogos = methods.map( method => {
			if ( method === 'credit-card' ) {
				return (
					<span key={ method } className="payment-methods-card__credit-cards-logos">
						<PaymentLogo type="mastercard" />
						<PaymentLogo type="visa" />
						<PaymentLogo type="amex" />
						<PaymentLogo type="discover" />
					</span>
				);
			}

			return <PaymentLogo type={ method } key={ method } />;
		} );

		return <div>{ methodsLogos }</div>;
	};

	render() {
		return (
			<Card className="payment-methods-card" highlight="info">
				<span>
					{ this.props.translate( 'We accept:' ) }
					{ this.renderPaymentMethods( this.props.paymentMethods ) }
				</span>
			</Card>
		);
	}
}

export default connect( state => {
	return {
		paymentMethods: getCurrentUserPaymentMethods( state ),
	};
} )( localize( PaymentMethodsCard ) );
