import { Button, Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface TwoFactorActionsProps {
	/**
	 * The current two-factor authentication type.
	 */
	twoFactorAuthType: string;

	/**
	 * Function to call when the user changes the authentication type.
	 */
	onChange: ( authType: string ) => void;

	/**
	 * Whether SMS is a supported authentication method.
	 */
	isSmsSupported: boolean;

	/**
	 * Whether authenticator app is a supported authentication method.
	 */
	isAuthenticatorSupported: boolean;

	/**
	 * Whether security key is a supported authentication method.
	 */
	isSecurityKeySupported: boolean;

	/**
	 * Whether SMS button should be enabled.
	 */
	isSmsAllowed: boolean;
}

/**
 * Component that renders buttons for different two-factor authentication methods.
 */
export default function TwoFactorActions( {
	twoFactorAuthType,
	onChange,
	isSmsSupported,
	isAuthenticatorSupported,
	isSecurityKeySupported,
	isSmsAllowed,
}: TwoFactorActionsProps ) {
	const translate = useTranslate();

	const handleClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		const authType = event.currentTarget.value;
		onChange( authType );
	};

	// Determine which buttons to show
	const isSecurityKeyAvailable = isSecurityKeySupported && twoFactorAuthType !== 'webauthn';
	const isSmsAvailable = isSmsSupported;
	const isAuthenticatorAvailable =
		isSecurityKeySupported && isAuthenticatorSupported && twoFactorAuthType !== 'authenticator';

	// Don't render anything if there are no available methods to switch to
	if ( ! isSmsAvailable && ! isAuthenticatorAvailable && ! isSecurityKeyAvailable ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				{ isSecurityKeyAvailable && (
					<Button
						value="webauthn"
						onClick={ handleClick }
						style={ {
							width: '100%',
							marginBottom: isAuthenticatorAvailable || isSmsAvailable ? '16px' : 0,
						} }
					>
						{ __( 'Continue with your security key' ) }
					</Button>
				) }

				{ isAuthenticatorAvailable && (
					<Button
						value="authenticator"
						onClick={ handleClick }
						style={ { width: '100%', marginBottom: isSmsAvailable ? '16px' : 0 } }
					>
						{ __( 'Continue with your authenticator app' ) }
					</Button>
				) }

				{ isSmsAvailable && (
					<Button
						value="sms"
						onClick={ handleClick }
						disabled={ ! isSmsAllowed }
						style={ { width: '100%' } }
					>
						{ __( 'Send code via text message' ) }
					</Button>
				) }
			</CardBody>
		</Card>
	);
}
