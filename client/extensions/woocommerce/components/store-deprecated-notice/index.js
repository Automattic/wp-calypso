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
				text={ translate(
					'Your favorite Store functions will become part of WooCommerce menus in February.'
				) }
				showDismiss={ false }
			>
				<NoticeAction href="https://wordpress.com/support/new-woocommerce-experience-on-wordpress-dot-com/">
					{ translate( 'Learn more' ) }
				</NoticeAction>
			</Notice>
		);
	}
}

export default StoreDeprecatedNotice;
