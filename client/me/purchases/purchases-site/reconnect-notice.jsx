/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class PurchaseReconnectNotice extends Component {
	static propTypes = {
		name: React.PropTypes.string,
		domain: React.PropTypes.string,
	}

	render() {
		const { translate, name, domain } = this.props;

		return (
			<Notice
				showDismiss={ false }
				status="is-error"
				text={ translate( '%(site)s has been disconnected from WordPress.com.', {
					args: {
						site: name,
					}
				} ) }>
				<NoticeAction href={ `/jetpack/connect?url=${ domain }` }>
					{ translate( 'Reconnect' ) }
				</NoticeAction>
			</Notice>
		);
	}
}

export default localize( PurchaseReconnectNotice );
