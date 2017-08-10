/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

const PaymentLogo = React.createClass( {
	propTypes: {
		type: React.PropTypes.string.isRequired,
		isCompact: React.PropTypes.bool,
	},

	render: function() {
		const classes = classNames( 'payment-logo', `is-${ this.props.type }`, {
			'is-compact': this.props.isCompact,
		} );

		return <div className={ classes } />;
	},
} );

module.exports = PaymentLogo;
