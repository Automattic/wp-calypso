/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { intersection } from 'lodash';

/**
 * Internal dependencies
 */
import PaymentLogo, { POSSIBLE_TYPES } from 'components/payment-logo';
import { getEnabledPaymentMethods } from 'lib/cart-values';

class PaymentMethods extends Component {
	renderPaymentMethods = methods => {
		if ( methods.includes( 'credit-card' ) ) {
			methods.splice(
				methods.indexOf( 'credit-card' ),
				1,
				'mastercard',
				'visa',
				'amex',
				'discover'
			);
		}

		methods = intersection( methods, POSSIBLE_TYPES );

		const methodsLogos = methods.map( method => {
			return <PaymentLogo type={ method } key={ method } />;
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
