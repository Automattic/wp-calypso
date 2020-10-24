/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { listMembershipsConnectedAccounts } from 'calypso/state/memberships/actions';
import { isFetching } from 'calypso/state/memberships/connected-accounts/selectors';

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
		isFetching: isFetching( state ),
	} ),
	{ listMembershipsConnectedAccounts }
)( QueryMembershipsConnectedAccounts );
