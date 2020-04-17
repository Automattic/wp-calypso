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
	isJetpack,
	isGutenboarding,
	twoFactorAuthType,
	twoFactorNotificationSent,
	rebootAfterLogin,
} ) {
	if ( twoFactorAuthType === 'webauthn' && isBrowserSupported ) {
		return (
			<div>
				<SecurityKeyForm twoFactorAuthType="webauthn" onSuccess={ handleValid2FACode } />
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
					isJetpack={ isJetpack }
					isGutenboarding={ isGutenboarding }
					onSuccess={ handleValid2FACode }
					twoFactorAuthType={ twoFactorAuthType }
				/>
			</div>
		);
	}

	if ( twoFactorAuthType === 'push' ) {
		return (
			<div>
				{ poller }
				<WaitingTwoFactorNotificationApproval
					isJetpack={ isJetpack }
					isGutenboarding={ isGutenboarding }
				/>
			</div>
		);
	}

	return null;
}
