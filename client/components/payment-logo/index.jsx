/** @format */

/**
 * External dependencies
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

class PaymentLogo extends React.Component {
	static propTypes = {
		type: PropTypes.string.isRequired,
		altText: PropTypes.string.isRequired,
		isCompact: PropTypes.bool,
	};

	render() {
		const classes = classNames( 'payment-logo', `is-${ this.props.type }`, {
			'is-compact': this.props.isCompact,
		} );

		return <div className={ classes } aria-label={ this.props.altText } />;
	}
}

export default PaymentLogo;
