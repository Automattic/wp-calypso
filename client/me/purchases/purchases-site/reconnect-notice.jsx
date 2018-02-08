/** @format */

/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { CALYPSO_CONTACT, JETPACK_CONTACT_SUPPORT } from 'lib/url/support';

class PurchaseReconnectNotice extends Component {
	static propTypes = {
		name: PropTypes.string,
		domain: PropTypes.string,
	};

	render() {
		const { translate, name, isJetpack } = this.props;
		let text = translate( 'You are no longer a user on %(site)s and cannot manage this purchase.', {
			args: {
				site: name,
			},
		} );
		if ( isJetpack ) {
			text = translate( '%(site)s has been disconnected from WordPress.com.', {
				args: {
					site: name,
				},
			} );
		}

		return (
			<Notice showDismiss={ false } status="is-error" text={ text }>
				<NoticeAction href={ isJetpack ? JETPACK_CONTACT_SUPPORT : CALYPSO_CONTACT }>
					{ translate( 'Contact Support' ) }
				</NoticeAction>
			</Notice>
		);
	}
}

export default localize( PurchaseReconnectNotice );
