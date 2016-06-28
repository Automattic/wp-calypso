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
	constructor( props ) {
		super( props );
		this.requestUserPurchases = this.requestUserPurchases.bind( this );
	}

	requestUserPurchases( props = this.props ) {
		this.props.fetchUserPurchases( props.userId );
	}

	componentWillMount() {
		this.requestUserPurchases();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.fetchingUserPurchases ||
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
	fetchingUserPurchases: PropTypes.bool.isRequired,
	fetchUserPurchases: PropTypes.func.isRequired
};

export default connect(
	state => {
		return {
			fetchingUserPurchases: isFetchingUserPurchases( state )
		};
	},
	{ fetchUserPurchases }
)( QueryUserPurchases );
