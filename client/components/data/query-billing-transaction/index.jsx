/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';

import isRequestingBillingTransaction from 'calypso/state/selectors/is-requesting-billing-transaction';
import { requestBillingTransaction } from 'calypso/state/billing-transactions/individual-transactions/actions';

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

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
