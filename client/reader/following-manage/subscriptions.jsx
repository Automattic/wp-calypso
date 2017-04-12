/**
 * External Dependencies
 */
import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import FollowingManageImport from './import';
import ReaderExportButton from 'blocks/reader-export-button';

class FollowingManageSubscriptions extends Component {
	render() {
		return (
			<div className="following-manage__subscriptions">
				<div className="following-manage__subscriptions-controls">
					<FollowingManageImport />
					<ReaderExportButton />
				</div>
			</div>
		);
	}
}

export default FollowingManageSubscriptions;
