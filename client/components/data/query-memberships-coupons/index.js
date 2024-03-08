import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestCoupons } from 'calypso/state/memberships/coupon-list/actions';

class QueryMembershipsCoupons extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestCoupons: PropTypes.func,
	};

	request() {
		if ( this.props.requesting ) {
			return;
		}

		if ( ! this.props.siteId ) {
			return;
		}

		this.props.requestCoupons( this.props.siteId );
	}

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId !== prevProps.siteId ) {
			this.request();
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestCoupons } )( QueryMembershipsCoupons );
