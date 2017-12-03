/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class ActivityLogSyncErrorNotice extends Component {
	componentWillMount() {
		this.setState( { dismissed: false } );
	}

	dismiss = () => this.setState( { dismissed: true } );

	render() {
		const { translate } = this.props;

		return (
			! this.state.dismissed &&
				<Notice
					status="is-error"
					showDismiss={ true }
					text={ translate( 'Events are no longer being synced. Contact our support to get help syncing events again.' ) }
					isCompact={ false }
					onDismissClick={ this.dismiss }
				>
					<NoticeAction href="/help/contact">{ translate( 'Help' ) }</NoticeAction>
				</Notice>
		);
	}
}

export default localize( ActivityLogSyncErrorNotice );
