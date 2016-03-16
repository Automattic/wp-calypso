/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PaymentLogo from '../index';

const PaymentLogoExamples = React.createClass( {
	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/paymentlogoexamples">PaymentLogo</a>
				</h2>
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
