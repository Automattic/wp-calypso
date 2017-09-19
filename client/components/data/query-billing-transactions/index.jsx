/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestBillingTransactions } from 'state/billing-transactions/actions';
import { isRequestingBillingTransactions } from 'state/selectors';

class QueryBillingTransactions extends Component {
	static propTypes = {
		requestingBillingTransactions: PropTypes.bool,
		requestBillingTransactions: PropTypes.func
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
	( state ) => ( {
		requestingBillingTransactions: isRequestingBillingTransactions( state )
	} ),
	{ requestBillingTransactions }
)( QueryBillingTransactions );
