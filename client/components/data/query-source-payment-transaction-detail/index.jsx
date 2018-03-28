/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchSourcePaymentTransactionDetail } from 'state/transaction-detail/actions';
import { getSourcePaymentTransactionDetail } from 'state/selectors';

class QuerySourcePaymentTransactionDetail extends React.Component {
	static propTypes = {
		pollIntervalMs: PropTypes.int,
	};

	static defaultProps = {
		pollIntervalMs: 0,
	};

	componentDidMount() {
		const { pollIntervalMs, orderId, transactionDetail, fetchTransactionDetail } = this.props;

		if ( pollIntervalMs ) {
			this.timer = setInterval( () => {
				// no need to fetch if it's there.
				if ( null !== transactionDetail ) {
					return;
				}
				fetchTransactionDetail( orderId );
			}, pollIntervalMs );
			return;
		}

		this.props.fetchTransactionDetail( orderId );
	}

	componentWillUnmount() {
		if ( this.timer ) {
			clearInterval( this.timer );
		}
	}
}

export default connect(
	( state, props ) => ( {
		transactionDetail: getSourcePaymentTransactionDetail( state, props.orderId ),
	} ),
	{
		fetchTransactionDetail: fetchSourcePaymentTransactionDetail,
	}
)( QuerySourcePaymentTransactionDetail );
