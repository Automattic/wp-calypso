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
import { fetchOrderTransaction } from 'state/order-transactions/actions';
import { getOrderTransaction } from 'state/selectors';

class QueryOrderTransaction extends React.Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		pollIntervalMs: PropTypes.number,
		transaction: PropTypes.object,
		fetchTransaction: PropTypes.func.isRequired,
	};

	static defaultProps = {
		pollIntervalMs: 0,
	};

	componentDidMount() {
		const { pollIntervalMs, orderId, transaction, fetchTransaction } = this.props;

		if ( pollIntervalMs ) {
			this.timer = setInterval( () => {
				// no need to fetch if it's there.
				if ( null !== transaction ) {
					return;
				}
				fetchTransaction( orderId );
			}, pollIntervalMs );
			return;
		}

		fetchTransaction( orderId );
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
		transaction: getOrderTransaction( state, props.orderId ),
	} ),
	{
		fetchTransaction: fetchOrderTransaction,
	}
)( QueryOrderTransaction );
