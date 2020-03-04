/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

class BackupRestorePage extends Component {
	render() {
		const { restoreId, siteId } = this.props;

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
} )( BackupRestorePage );
