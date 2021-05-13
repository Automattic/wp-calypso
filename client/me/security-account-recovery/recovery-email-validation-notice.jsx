/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

class RecoveryEmailValidationNotice extends Component {
	render() {
		const { translate, onResend, hasSent } = this.props;

		return (
			<Notice
				className="security-account-recovery__validation-notice"
				status="is-warning"
				text={ translate(
					'Please verify your recovery email address. ' +
						'Check your inbox for a confirmation link.'
				) }
				showDismiss={ false }
			>
				{ ! hasSent && (
					<NoticeAction href="#" onClick={ onResend }>
						{ translate( 'Resend' ) }
					</NoticeAction>
				) }
			</Notice>
		);
	}
}

export default localize( RecoveryEmailValidationNotice );
