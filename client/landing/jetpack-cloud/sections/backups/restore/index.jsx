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
			restoreId
				? <div>Welcome to the restore page { siteId }. Restoring backup ID { restoreId }.</div>
				: <div>Welcome to the restore page for { siteId }. You'll choose a restore point here.</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( BackupRestorePage );
