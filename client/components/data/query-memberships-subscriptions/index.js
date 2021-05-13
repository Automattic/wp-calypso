/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSubscriptionsList } from 'calypso/state/memberships/subscriptions/actions';

class QueryMembershipsSubscriptions extends Component {
	componentDidMount() {
		this.props.requestSubscriptionsList();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestSubscriptionsList } )( QueryMembershipsSubscriptions );
