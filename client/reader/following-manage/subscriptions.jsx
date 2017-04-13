/**
 * External Dependencies
 */
import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import ReaderImportButton from 'blocks/reader-import-button';
import ReaderExportButton from 'blocks/reader-export-button';

class FollowingManageSubscriptions extends Component {
	render() {
		return (
			<div className="following-manage__subscriptions">
				<div className="following-manage__subscriptions-controls">
					<ReaderImportButton />
					<ReaderExportButton />
				</div>
			</div>
		);
	}
}

export default FollowingManageSubscriptions;
