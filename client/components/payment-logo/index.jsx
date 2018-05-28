/** @format */

/**
 * External dependencies
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { keys } from 'lodash';

const ALT_TEXT = {
	alipay: 'Alipay',
	amex: 'American Express',
	bancontact: 'Bancontact',
	'brazil-tef': 'Transferência bancária',
	diners: 'Diners Club',
	discover: 'Discover',
	eps: 'eps',
	'emergent-paywall': 'Net Banking / Paytm / Debit Card',
	giropay: 'Giropay',
	ideal: 'iDEAL',
	jcb: 'JCB',
	mastercard: 'MasterCard',
	p24: 'Przelewy24',
	paypal: 'PayPal',
	placeholder: '',
	unionpay: 'UnionPay',
	visa: 'VISA',
};

export const POSSIBLE_TYPES = keys( ALT_TEXT );

class PaymentLogo extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		type: PropTypes.oneOf( POSSIBLE_TYPES ),
		altText: PropTypes.string,
		isCompact: PropTypes.bool,
	};

	render() {
		const { altText, className, isCompact, type } = this.props;

		const classes = classNames(
			'payment-logo',
			`is-${ type }`,
			{ 'is-compact': isCompact },
			className
		);

		return <div className={ classes } aria-label={ altText || ALT_TEXT[ type ] || '' } />;
	}
}

export default PaymentLogo;
