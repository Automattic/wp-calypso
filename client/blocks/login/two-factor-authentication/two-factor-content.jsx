/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PushNotificationApprovalPoller from './push-notification-approval-poller';
import VerificationCodeForm from './verification-code-form';
import SecurityKeyForm from './security-key-form';
import WaitingTwoFactorNotificationApproval from './waiting-notification-approval';

export default function TwoFactorContent( {
	handleValid2FACode,
	isBrowserSupported,
	switchTwoFactorAuthType,
	twoFactorAuthType,
	twoFactorNotificationSent,
	rebootAfterLogin,
} ) {
	if ( twoFactorAuthType === 'webauthn' && isBrowserSupported ) {
		return (
			<div>
				<SecurityKeyForm
					onSuccess={ handleValid2FACode }
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
				/>
			</div>
		);
	}

	let poller;
	if ( twoFactorAuthType && twoFactorNotificationSent === 'push' ) {
		poller = <PushNotificationApprovalPoller onSuccess={ rebootAfterLogin } />;
	}

	if ( [ 'authenticator', 'sms', 'backup' ].includes( twoFactorAuthType ) ) {
		return (
			<div>
				{ poller }
				<VerificationCodeForm
					onSuccess={ handleValid2FACode }
					twoFactorAuthType={ twoFactorAuthType }
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
				/>
			</div>
		);
	}

	if ( twoFactorAuthType === 'push' ) {
		return (
			<div>
				{ poller }
				<WaitingTwoFactorNotificationApproval switchTwoFactorAuthType={ switchTwoFactorAuthType } />
			</div>
		);
	}

	return null;
}
