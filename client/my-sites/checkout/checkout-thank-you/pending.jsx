/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import QuerySourcePaymentTransactionDetail from 'components/data/query-source-payment-transaction-detail';

class CheckoutPending extends PureComponent {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
	};

	render() {
		const { orderId } = this.props;

		return (
			<div>
				<QuerySourcePaymentTransactionDetail orderId={ orderId } />
				<p>Waiting for the payment result of { orderId }</p>
			</div>
		);
	}
}

export default CheckoutPending;
