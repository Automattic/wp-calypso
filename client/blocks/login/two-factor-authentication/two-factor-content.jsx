import { localize } from 'i18n-calypso';
import PushNotificationApprovalPoller from './push-notification-approval-poller';
import SecurityKeyForm from './security-key-form';
import SecurityKeyUnsupported from './security-key-unsupported';
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
	if ( twoFactorAuthType === 'webauthn' ) {
		return isBrowserSupported ? (
			<div>
				<SecurityKeyForm
					onSuccess={ handleValid2FACode }
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
				/>
			</div>
		) : (
			<SecurityKeyUnsupported switchTwoFactorAuthType={ switchTwoFactorAuthType } />
		);
	}

	let poller;
	if ( twoFactorAuthType && twoFactorNotificationSent === 'push' ) {
		poller = <PushNotificationApprovalPoller onSuccess={ rebootAfterLogin } />;
	}

	if ( [ 'authenticator', 'email', 'sms', 'backup' ].includes( twoFactorAuthType ) ) {
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
