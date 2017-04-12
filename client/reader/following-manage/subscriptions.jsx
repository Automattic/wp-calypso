/**
 * External Dependencies
 */
import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import FollowingManageImport from './import';

class FollowingManageSubscriptions extends Component {
	render() {
		return (
			<div className="following-manage__subscriptions">
				<div className="following-manage__subscriptions-controls">
					<FollowingManageImport />
				</div>
			</div>
		);
	}
}

export default FollowingManageSubscriptions;
