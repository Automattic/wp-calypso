/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchOrderTransaction } from 'calypso/state/order-transactions/actions';
import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';
import isFetchingOrderTransaction from 'calypso/state/selectors/is-fetching-order-transaction';

class QueryOrderTransaction extends React.Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		pollIntervalMs: PropTypes.number,
		fetchTransaction: PropTypes.func.isRequired,
		error: PropTypes.object,
		isFetching: PropTypes.bool,
	};

	static defaultProps = {
		pollIntervalMs: 0,
	};

	canFetch = () => {
		const { error, isFetching } = this.props;

		// fetch if no error has occurred and a fetch is not in progress.
		return null == error && ! isFetching;
	};

	componentDidMount() {
		const { pollIntervalMs, orderId, fetchTransaction } = this.props;

		if ( pollIntervalMs ) {
			this.timer = setInterval( () => {
				if ( this.canFetch() ) {
					fetchTransaction( orderId );
				}
			}, pollIntervalMs );
			return;
		}

		if ( this.canFetch() ) {
			fetchTransaction( orderId );
		}
	}

	componentWillUnmount() {
		if ( this.timer ) {
			clearInterval( this.timer );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, props ) => ( {
		error: getOrderTransactionError( state, props.orderId ),
		isFetching: isFetchingOrderTransaction( state, props.orderId ),
	} ),
	{
		fetchTransaction: fetchOrderTransaction,
	}
)( QueryOrderTransaction );
