/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

class BackupDownloadPage extends Component {
	render() {
		const { siteId, downloadId } = this.props;

		return (
			<div>
				<div>Welcome to the download page</div>
				<div>Site ID: { siteId }</div>
				<div>Download ID: { downloadId }</div>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( BackupDownloadPage );
