/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */

import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

class StoreDeprecatedNotice extends Component {
	render() {
		return (
			<Notice
				status="is-warning"
				text={ translate( 'Store is moving to WooCommerce' ) }
				showDismiss={ false }
			>
				<NoticeAction href="https://wordpress.com/support/store/">
					{ translate( 'More' ) }
				</NoticeAction>
			</Notice>
		);
	}
}

export default StoreDeprecatedNotice;
