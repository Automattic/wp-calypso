/**
 * External dependencies
 */
import React from 'react';

const PaymentLogo = React.createClass( {
	propTypes: {
		type: React.PropTypes.string.isRequired
	},

	render: function() {
		const classes = `payment-logo is-${ this.props.type }`;

		return (
			<div className={ classes } />
		);
	}
} );

module.exports = PaymentLogo;
