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
import { isRequestingBillingTransactions } from 'client/state/selectors';
import { requestBillingTransactions } from 'client/state/billing-transactions/actions';

class QueryBillingTransactions extends Component {
	static propTypes = {
		requestingBillingTransactions: PropTypes.bool,
		requestBillingTransactions: PropTypes.func,
	};

	componentDidMount() {
		if ( this.props.requestingBillingTransactions ) {
			return;
		}

		this.props.requestBillingTransactions();
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		requestingBillingTransactions: isRequestingBillingTransactions( state ),
	} ),
	{ requestBillingTransactions }
)( QueryBillingTransactions );
