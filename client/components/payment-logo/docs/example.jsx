/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PaymentLogo from '../index';

class PaymentLogoExamples extends React.PureComponent {
	static displayName = 'PaymentLogo';

	render() {
		return (
			<div>
				<PaymentLogo type="amex" /> <PaymentLogo type="discover" /> {' '}
				<PaymentLogo type="mastercard" /> <PaymentLogo type="visa" /> {' '}
				<PaymentLogo type="paypal" isCompact /> <PaymentLogo type="paypal" />
			</div>
		);
	}
}

export default PaymentLogoExamples;
