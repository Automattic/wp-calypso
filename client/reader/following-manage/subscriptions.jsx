/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ReaderImportButton from 'blocks/reader-import-button';

class FollowingManageSubscriptions extends Component {

	render() {
		return (
			<div className="following-manage__subscriptions">
				<div className="following-manage__subscriptions-controls">
					<ReaderImportButton />
				</div>
			</div>
		);
	}
}

export default localize( FollowingManageSubscriptions );
