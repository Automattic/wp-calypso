/** @format */

/**
 * External dependencies
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { keys } from 'lodash';
import i18n from 'i18n-calypso';

const ALT_TEXT = {
	alipay: 'Alipay',
	amex: 'American Express',
	bancontact: 'Bancontact',
	'brazil-tef': 'Transferência bancária',
	diners: 'Diners Club',
	discover: 'Discover',
	eps: 'eps',
	giropay: 'Giropay',
	ideal: 'iDEAL',
	jcb: 'JCB',
	mastercard: 'Mastercard',
	p24: 'Przelewy24',
	paypal: 'PayPal',
	placeholder: '',
	unionpay: 'UnionPay',
	visa: 'Visa',
	wechat: i18n.translate( 'WeChat Pay', {
		comment: 'Name for WeChat Pay - https://pay.weixin.qq.com/',
	} ),
	sofort: 'Sofort',
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
