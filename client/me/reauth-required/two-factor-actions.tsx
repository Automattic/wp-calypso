import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { type MouseEvent, useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEventWithClientId } from 'calypso/state/analytics/actions';
import './two-factor-actions.scss';

interface TwoFactorActionsProps {
	isAuthenticatorSupported: boolean;
	isSecurityKeySupported: boolean;
	isSmsSupported: boolean;
	isSmsAllowed: boolean;
	onChange: ( authType: string ) => void;
	twoFactorAuthType: string;
}

function TwoFactorActions( {
	isAuthenticatorSupported,
	isSecurityKeySupported,
	isSmsSupported,
	isSmsAllowed,
	onChange,
	twoFactorAuthType,
}: TwoFactorActionsProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const handleButtonClick = useCallback(
		( event: MouseEvent< HTMLButtonElement > ) => {
			let tracksEvent;

			switch ( event.currentTarget.value ) {
				case 'sms':
					tracksEvent = 'calypso_twostep_reauth_sms_clicked';
					break;
				case 'authenticator':
					tracksEvent = 'calypso_twostep_reauth_authenticator_clicked';
					break;
				case 'webauthn':
					tracksEvent = 'calypso_twostep_reauth_webauthn_clicked';
					break;
			}

			if ( tracksEvent ) {
				dispatch( recordTracksEventWithClientId( tracksEvent ) );
			}

			onChange( event.currentTarget.value );
		},
		[ dispatch, onChange ]
	);

	const isSecurityKeyAvailable = isSecurityKeySupported && twoFactorAuthType !== 'webauthn';
	const isSmsAvailable = isSmsSupported;
	const isAuthenticatorAvailable =
		isSecurityKeySupported && isAuthenticatorSupported && twoFactorAuthType !== 'authenticator';

	if ( ! isSmsAvailable && ! isAuthenticatorAvailable && ! isSecurityKeyAvailable ) {
		return null;
	}

	return (
		<Card className="two-factor-actions__actions">
			{ isSecurityKeyAvailable && (
				<Button value="webauthn" onClick={ handleButtonClick }>
					{ translate( 'Continue with your security\u00A0key' ) }
				</Button>
			) }

			{ isAuthenticatorAvailable && (
				<Button value="authenticator" onClick={ handleButtonClick }>
					{ translate( 'Continue with your authenticator\u00A0app' ) }
				</Button>
			) }

			{ isSmsAvailable && (
				<Button value="sms" disabled={ ! isSmsAllowed } onClick={ handleButtonClick }>
					{ translate( 'Send code via\u00A0text\u00A0message' ) }
				</Button>
			) }
		</Card>
	);
}

export default TwoFactorActions;
