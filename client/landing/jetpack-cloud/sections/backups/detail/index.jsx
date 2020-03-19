/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';

class BackupDetailPage extends Component {
	render() {
		const { siteId, backupId } = this.props;

		return (
			<Main>
				<DocumentHead title="Backup Details" />
				<div>Welcome to the backup detail page</div>
				<div>Site ID: { siteId }</div>
				<div>Backup ID: { backupId }</div>
			</Main>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( BackupDetailPage );
