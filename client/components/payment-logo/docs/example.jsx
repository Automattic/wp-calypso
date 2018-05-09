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
				<PaymentLogo type="alipay" /> <PaymentLogo type="amex" /> <PaymentLogo type="bancontact" />{' '}
				<PaymentLogo type="diners" /> <PaymentLogo type="discover" /> <PaymentLogo type="eps" />{' '}
				<PaymentLogo type="giropay" /> <PaymentLogo type="ideal" /> <PaymentLogo type="jcb" />{' '}
				<PaymentLogo type="mastercard" /> <PaymentLogo type="p24" /> <PaymentLogo type="paypal" />
				<PaymentLogo type="paypal" isCompact /> <PaymentLogo type="unionpay" />{' '}
				<PaymentLogo type="visa" />
			</div>
		);
	}
}

export default PaymentLogoExamples;
