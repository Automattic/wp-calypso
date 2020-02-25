/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

class BackupsPage extends Component {
	render() {
		return <div>Welcome to the backup detail page for site { this.props.siteId }</div>;
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( BackupsPage );
