import classNames from 'classnames';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

const PaymentLogo = React.createClass( {
	propTypes: {
		type: PropTypes.string.isRequired,
		isCompact: PropTypes.bool
	},

	render: function() {
		const classes = classNames( 'payment-logo', `is-${ this.props.type }`, {
			'is-compact': this.props.isCompact
		} );

		return (
			<div className={ classes } />
		);
	}
} );

export default PaymentLogo;
