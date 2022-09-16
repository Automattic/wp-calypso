import PushNotificationApprovalPoller from './push-notification-approval-poller';
import SecurityKeyForm from './security-key-form';
import VerificationCodeForm from './verification-code-form';
import WaitingTwoFactorNotificationApproval from './waiting-notification-approval';

export default function TwoFactorContent( {
	handleValid2FACode,
	isBrowserSupported,
	switchTwoFactorAuthType,
	twoFactorAuthType,
	twoFactorNotificationSent,
	rebootAfterLogin,
	isWoo,
	isPartnerSignup,
} ) {
	if ( twoFactorAuthType === 'webauthn' && isBrowserSupported ) {
		return (
			<div>
				<SecurityKeyForm
					onSuccess={ handleValid2FACode }
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
					showOrDivider={ isWoo && ! isPartnerSignup }
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
					key={ twoFactorAuthType }
					onSuccess={ handleValid2FACode }
					twoFactorAuthType={ twoFactorAuthType }
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
					showOrDivider={ isWoo && ! isPartnerSignup }
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
