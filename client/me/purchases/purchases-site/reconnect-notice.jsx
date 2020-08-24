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
import { CALYPSO_CONTACT } from 'lib/url/support';

class PurchaseReconnectNotice extends Component {
	static propTypes = {
		name: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate, name, isJetpack } = this.props;

		const text = isJetpack
			? // translators: site is the site name. Eg "domain.com"
			  translate( '%(site)s has been disconnected from WordPress.com.', {
					args: {
						site: name,
					},
			  } )
			: // translators: site is the site name. Eg "domain.com"
			  translate( 'You are no longer a user on %(site)s and cannot manage this purchase.', {
					args: {
						site: name,
					},
			  } );

		return (
			<Notice showDismiss={ false } status="is-error" text={ text }>
				{
					/* Disconnected Jetpack sites can remove purchases. No need to contact support */
					! isJetpack && (
						<NoticeAction href={ CALYPSO_CONTACT }>{ translate( 'Contact Support' ) }</NoticeAction>
					)
				}
			</Notice>
		);
	}
}

export default localize( PurchaseReconnectNotice );
