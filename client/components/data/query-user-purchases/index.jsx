/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchUserPurchases } from 'state/purchases/actions';
import { hasLoadedUserPurchasesFromServer, isFetchingUserPurchases } from 'state/purchases/selectors';

class QueryUserPurchases extends Component {
	requestUserPurchases( nextProps ) {
		const userChanged = nextProps && this.props.userId !== nextProps.userId,
			props = nextProps || this.props;

		if ( ( ! props.isFetchingUserPurchases && ! props.hasLoadedUserPurchasesFromServer ) || userChanged ) {
			this.props.fetchUserPurchases( props.userId );
		}
	}

	componentWillMount() {
		this.requestUserPurchases();
	}

	componentWillReceiveProps( nextProps ) {
		this.requestUserPurchases( nextProps );
	}

	render() {
		return null;
	}
}

QueryUserPurchases.propTypes = {
	userId: PropTypes.number.isRequired,
	hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
	isFetchingUserPurchases: PropTypes.bool.isRequired,
	fetchUserPurchases: PropTypes.func.isRequired
};

export default connect(
	state => {
		return {
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			isFetchingUserPurchases: isFetchingUserPurchases( state )
		};
	},
	{ fetchUserPurchases }
)( QueryUserPurchases );
