/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { listMembershipsConnectedAccounts } from 'state/memberships/actions';

class QueryMembershipsConnectedAccounts extends Component {
	componentDidMount() {
		if ( ! this.props.isFetching ) {
			this.props.listMembershipsConnectedAccounts();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		isFetching: get( state, [ 'memberships', 'connectedAccounts', 'isFetching' ], false ),
	} ),
	{ listMembershipsConnectedAccounts }
)( QueryMembershipsConnectedAccounts );
