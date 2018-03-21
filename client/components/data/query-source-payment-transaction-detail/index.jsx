/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchSourcePaymentTransactionDetail } from 'state/transaction-detail/actions';

class QuerySourcePaymentTransactionDetail extends React.Component {
	componentDidMount() {
		this.props.fetchSourcePaymentTransactionDetail( this.props.orderId );
	}
}

export default connect( () => {}, {
	fetchSourcePaymentTransactionDetail,
} )( QuerySourcePaymentTransactionDetail );
