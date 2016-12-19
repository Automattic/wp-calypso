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

class RecoveryEmailValidationNotice extends Component {
	render() {
		const {
			translate,
		} = this.props;

		return (
			<Notice
				status="is-warning"
				text={ translate( 'Please verify your recovery email address.' +
						'Check your inbox for a confirmation link.' ) }
				showDismiss={ false }
			>
				<NoticeAction href="#">
					{ translate( 'Resend' ) }
				</NoticeAction>
			</Notice>
		);
	}
}

export default localize( RecoveryEmailValidationNotice );
