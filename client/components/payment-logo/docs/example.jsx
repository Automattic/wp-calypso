/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import PaymentLogo from '../index';

const PaymentLogoExamples = React.createClass( {
	mixins: [ PureRenderMixin ],

	render() {
		return (
			<DocsExample
				title="PaymentLogo"
				url="/devdocs/design/paymentlogoexamples"
				componentUsageStats={ this.props.getUsageStats( PaymentLogo ) }
			>
				<div>
					<PaymentLogo type="amex" /> { ' ' }
					<PaymentLogo type="discover" /> { ' ' }
					<PaymentLogo type="mastercard" /> { ' ' }
					<PaymentLogo type="visa" /> { ' ' }
					<PaymentLogo type="paypal" isCompact /> { ' ' }
					<PaymentLogo type="paypal" />
				</div>
			</DocsExample>
		);
	}
} );

module.exports = PaymentLogoExamples;
