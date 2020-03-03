/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

class ScanScannerPage extends Component {
	render() {
		return <div>Welcome to the scanner page for site { this.props.siteId }</div>;
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
	};
} )( ScanScannerPage );
