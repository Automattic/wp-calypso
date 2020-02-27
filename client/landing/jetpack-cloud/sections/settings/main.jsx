/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import ServerConnectionIndicator from '../../components/server-connection-indicator';

class SettingsPage extends Component {
	render() {
		return <ServerConnectionIndicator />;
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( SettingsPage );
