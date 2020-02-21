/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentUserName } from 'state/current-user/selectors';

class JetpackCloudDashboardPage extends Component {
	render() {
		return ( <div>Welcome to the dashboard, { this.props.currentUserName }!</div> );
	}
}

export default connect( state => {
	return {
		currentUserName: getCurrentUserName( state ),
	};
} )( JetpackCloudDashboardPage );
