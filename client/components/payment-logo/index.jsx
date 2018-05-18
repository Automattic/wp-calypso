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
	diners: 'Diners Club',
	discover: 'Discover',
	eps: 'eps',
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
		type: PropTypes.oneOf( POSSIBLE_TYPES ),
		altText: PropTypes.string,
		isCompact: PropTypes.bool,
	};

	render() {
		const { altText, isCompact, type } = this.props;

		const classes = classNames( 'payment-logo', `is-${ type }`, {
			'is-compact': isCompact,
		} );

		return <div className={ classes } aria-label={ altText || ALT_TEXT[ type ] || '' } />;
	}
}

export default PaymentLogo;
