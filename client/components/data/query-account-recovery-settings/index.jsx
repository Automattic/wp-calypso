import { Component } from 'react';
import { connect } from 'react-redux';
import { isFetchingAccountRecoverySettings } from 'calypso/state/account-recovery/selectors';
import { accountRecoverySettingsFetch } from 'calypso/state/account-recovery/settings/actions';

class QueryAccountRecoverySettings extends Component {
	componentDidMount() {
		if ( ! this.props.isFetching ) {
			this.props.accountRecoverySettingsFetch();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		isFetching: isFetchingAccountRecoverySettings( state ),
	} ),
	{ accountRecoverySettingsFetch }
)( QueryAccountRecoverySettings );
