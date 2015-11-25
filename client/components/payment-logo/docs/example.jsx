/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PaymentLogo from '../index';

const PaymentLogoExamples = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>PaymentLogo</h2>
				<div>
					<PaymentLogo type="amex" /> { ' ' }
					<PaymentLogo type="discover" /> { ' ' }
					<PaymentLogo type="mastercard" /> { ' ' }
					<PaymentLogo type="visa" /> { ' ' }
					<PaymentLogo type="paypal" isCompact /> { ' ' }
					<PaymentLogo type="paypal" />
				</div>
			</div>
		);
	}
} );

module.exports = PaymentLogoExamples;
