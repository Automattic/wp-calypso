/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingUserPurchases } from 'state/purchases/selectors';
import { fetchUserPurchases } from 'state/purchases/actions';

class QueryUserPurchases extends Component {
	requestUserPurchases( props = this.props ) {
		this.props.fetchUserPurchases( props.userId );
	}

	componentWillMount() {
		this.requestUserPurchases();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requesting ||
			! nextProps.userId ||
			( this.props.userId === nextProps.userId ) ) {
			return;
		}
		this.requestUserPurchases( nextProps );
	}

	render() {
		return null;
	}
}

QueryUserPurchases.propTypes = {
	userId: PropTypes.number.isRequired,
	requesting: PropTypes.bool.isRequired,
	fetchUserPurchases: PropTypes.func.isRequired
};

export default connect(
	state => {
		return {
			requesting: isFetchingUserPurchases( state )
		};
	},
	{ fetchUserPurchases }
)( QueryUserPurchases );
