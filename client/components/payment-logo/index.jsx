/** @format */

/**
 * External dependencies
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { keys } from 'lodash';

const ALT_TEXT = {
	amex: 'American Express',
	discover: 'Discover',
	mastercard: 'MasterCard',
	visa: 'VISA',
	paypal: 'PayPal',
};

const POSSIBLE_TYPES = keys( ALT_TEXT );

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
