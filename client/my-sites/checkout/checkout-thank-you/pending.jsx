/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class CheckoutPending extends PureComponent {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
	};

	render() {
		const { orderId } = this.props;

		return (
			<div>
				<p>Waiting for the payment result of { orderId }</p>
			</div>
		);
	}
}

export default CheckoutPending;
