import clsx from 'clsx';
import i18n from 'i18n-calypso';
import { keys } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import creditCardAmexImage from 'calypso/assets/images/upgrades/cc-amex.svg';
import creditCardDinersImage from 'calypso/assets/images/upgrades/cc-diners.svg';
import creditCardDiscoverImage from 'calypso/assets/images/upgrades/cc-discover.svg';
import creditCardJCBImage from 'calypso/assets/images/upgrades/cc-jcb.svg';
import creditCardMasterCardImage from 'calypso/assets/images/upgrades/cc-mastercard.svg';
import creditCardUnionPayImage from 'calypso/assets/images/upgrades/cc-unionpay.svg';
import creditCardVisaImage from 'calypso/assets/images/upgrades/cc-visa.svg';
import upiImage from 'calypso/assets/images/upgrades/upi.svg';

import './style.scss';

const LOGO_PATHS = {
	amex: creditCardAmexImage,
	diners: creditCardDinersImage,
	discover: creditCardDiscoverImage,
	jcb: creditCardJCBImage,
	mastercard: creditCardMasterCardImage,
	unionpay: creditCardUnionPayImage,
	visa: creditCardVisaImage,
	upi: upiImage,
};

const ALT_TEXT = {
	alipay: 'Alipay',
	amex: 'American Express',
	'apple-pay': 'Apple Pay',
	bancontact: 'Bancontact',
	diners: 'Diners Club',
	discover: 'Discover',
	eps: 'eps',
	ideal: 'iDEAL',
	jcb: 'JCB',
	mastercard: 'Mastercard',
	netbanking: 'Net Banking',
	p24: 'Przelewy24',
	paypal: 'PayPal',
	placeholder: 'Payment logo',
	upi: 'UPI',
	unionpay: 'UnionPay',
	visa: 'Visa',
	wechat: i18n.translate( 'WeChat Pay', {
		comment: 'Name for WeChat Pay - https://pay.weixin.qq.com/',
	} ),
	sofort: 'Sofort',
};

export const POSSIBLE_TYPES = keys( ALT_TEXT );

class PaymentLogo extends Component {
	static propTypes = {
		className: PropTypes.string,
		type: PropTypes.oneOf( POSSIBLE_TYPES ),
		altText: PropTypes.string,
		isCompact: PropTypes.bool,
		disabled: PropTypes.bool,
	};

	render() {
		const { altText, className, isCompact, type, disabled } = this.props;

		const classes = clsx(
			'payment-logo',
			`is-${ type }`,
			{ 'is-compact': isCompact },
			{ disabled },
			className
		);

		// Credit card images have been migrated to Webpack, while the remaining
		// images are still referenced in the stylesheets (they’re still to be migrated)
		const logoPath = LOGO_PATHS[ type ];
		const logoStyle = logoPath ? { backgroundImage: `url(${ logoPath })` } : undefined;

		return (
			<div
				className={ classes }
				style={ logoStyle }
				aria-label={ altText || ALT_TEXT[ type ] || '' }
			/>
		);
	}
}

export default PaymentLogo;
