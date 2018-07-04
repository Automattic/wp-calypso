/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingMembershipsSubscriptions from 'state/selectors/is-requesting-memberships-subscriptions';
import { requestSubscriptionsList } from 'state/memberships/subscriptions/actions';

class QueryMembershipsSubscriptions extends Component {
	componentDidMount() {
		if ( this.props.requesting ) {
			return;
		}

		this.props.requestSubscriptionsList();
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		requesting: isRequestingMembershipsSubscriptions( state ),
	} ),
	{ requestSubscriptionsList }
)( QueryMembershipsSubscriptions );
