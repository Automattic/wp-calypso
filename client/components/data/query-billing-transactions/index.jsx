/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingBillingTransactions } from 'state/selectors';
import { requestBillingTransactions } from 'state/billing-transactions/actions';

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
