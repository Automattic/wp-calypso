/** @format */

/**
 * External dependencies
 */
import page from 'page';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getOrderTransaction } from 'state/selectors';
import QuerySourcePaymentTransactionDetail from 'components/data/query-source-payment-transaction-detail';

class CheckoutPending extends PureComponent {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	componentWillReceiveProps( nextProps ) {
		const { processingStatus } = nextProps.paymentInfo;

		if ( 'success' === processingStatus ) {
			page( `/checkout/thank-you/${ this.props.siteSlug }` );
			return;
		}

		// redirect users back to the checkout page so they can try again.
		if ( 'payment-failure' === processingStatus ) {
			page( `/checkout/${ this.props.siteSlug }` );
			return;
		}
	}

	render() {
		const { orderId } = this.props;

		// TODO:
		// Replace this placeholder by the real one
		return (
			<div>
				<QuerySourcePaymentTransactionDetail orderId={ orderId } pollIntervalMs={ 5000 } />
				<p>Waiting for the payment result of { orderId }</p>
			</div>
		);
	}
}

export default connect( ( state, props ) => ( {
	transaction: getOrderTransaction( state, props.orderId ),
} ) )( CheckoutPending );
