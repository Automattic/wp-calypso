/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

class JetpackCloudBackupDetailPage extends Component {
	render() {
		const { siteId, backupId } = this.props;

		return (
			<div>
				<div>Welcome to the backup detail page</div>
				<div>Site ID: { siteId }</div>
				<div>Backup ID: { backupId }</div>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( JetpackCloudBackupDetailPage );
