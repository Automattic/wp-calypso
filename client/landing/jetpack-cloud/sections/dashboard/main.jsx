/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getCurrentUserName } from 'state/current-user/selectors';
import Main from 'components/main';

class DashboardPage extends Component {
	render() {
		return (
			<Main>
				<DocumentHead title="Welcome to Jetpack Cloud" />
				Welcome to the dashboard, { this.props.currentUserName }!
			</Main>
		);
	}
}

export default connect( state => {
	return {
		currentUserName: getCurrentUserName( state ),
	};
} )( DashboardPage );
