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
			<div>
				<PaymentLogo type="amex" /> { ' ' }
				<PaymentLogo type="discover" /> { ' ' }
				<PaymentLogo type="mastercard" /> { ' ' }
				<PaymentLogo type="visa" /> { ' ' }
				<PaymentLogo type="paypal" isCompact /> { ' ' }
				<PaymentLogo type="paypal" />
			</div>
		);
	}
} );

module.exports = PaymentLogoExamples;
