import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestBillingTransactions } from 'calypso/state/billing-transactions/actions';
import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';

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
	( state ) => ( {
		requestingBillingTransactions: isRequestingBillingTransactions( state ),
	} ),
	{ requestBillingTransactions }
)( QueryBillingTransactions );
