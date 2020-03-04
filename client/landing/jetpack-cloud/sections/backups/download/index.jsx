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
			<div className="backup-restore-page">
				You have chosen to restore site { siteId } to { restoreId }.
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
