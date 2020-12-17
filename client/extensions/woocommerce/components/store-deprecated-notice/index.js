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
import './style.scss';

class StoreDeprecatedNotice extends Component {
	render() {
		return (
			<div className="store-deprecated-notice">
				<Notice
					status="is-success"
					icon="notice"
					text={ translate( 'Store is moving to WooCommerce' ) }
					showDismiss={ false }
				>
					<NoticeAction href="https://wordpress.com/support/store/">
						{ translate( 'More' ) }
					</NoticeAction>
				</Notice>
			</div>
		);
	}
}

export default StoreDeprecatedNotice;
