import { localize } from 'i18n-calypso';
import PushNotificationApprovalPoller from './push-notification-approval-poller';
import SecurityKeyForm from './security-key-form';
import VerificationCodeForm from './verification-code-form';
import WaitingTwoFactorNotificationApproval from './waiting-notification-approval';

function TwoFactorContent( {
	handleValid2FACode,
	isBrowserSupported,
	switchTwoFactorAuthType,
	twoFactorAuthType,
	twoFactorNotificationSent,
	rebootAfterLogin,
	isGravPoweredClient,
	translate,
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
		let verificationCodeInputPlaceholder = '';

		if ( isGravPoweredClient ) {
			verificationCodeInputPlaceholder =
				twoFactorAuthType === 'backup'
					? translate( 'Enter your backup code' )
					: translate( 'Enter your verification code' );
		}

		return (
			<div>
				{ poller }
				<VerificationCodeForm
					key={ twoFactorAuthType }
					onSuccess={ handleValid2FACode }
					twoFactorAuthType={ twoFactorAuthType }
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
					verificationCodeInputPlaceholder={ verificationCodeInputPlaceholder }
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

export default localize( TwoFactorContent );
