/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPastBillingTransaction, isRequestingBillingTransaction } from 'state/selectors';
import { requestBillingTransaction } from 'state/billing-transactions/individual-transactions/actions';

class QueryBillingTransaction extends Component {
	fetch( props ) {
		const { transaction, transactionId, requestingBillingTransaction } = props;

		if ( transaction || requestingBillingTransaction ) {
			return;
		}

		props.requestBillingTransaction( transactionId );
	}

	componentDidMount() {
		this.fetch( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.fetch( nextProps );
	}

	render() {
		return null;
	}
}

QueryBillingTransaction.propTypes = {
	transactionId: PropTypes.string.isRequired,
};

export default connect(
	( state, { transactionId } ) => ( {
		transaction: getPastBillingTransaction( state, transactionId ),
		requestingBillingTransaction: isRequestingBillingTransaction( state, transactionId ),
	} ),
	{
		requestBillingTransaction,
	}
)( QueryBillingTransaction );
