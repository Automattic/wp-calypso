import { MagicLoginButton, QrCodeLoginButton } from 'calypso/components/social-buttons';

interface LoginButtonsProps {
	twoFactorAuthType: string;
	usernameOrEmail: string;
}

const LoginButtons = ( { twoFactorAuthType, usernameOrEmail }: LoginButtonsProps ) => {
	return (
		<>
			<MagicLoginButton
				twoFactorAuthType={ twoFactorAuthType }
				usernameOrEmail={ usernameOrEmail }
			/>
			<QrCodeLoginButton twoFactorAuthType={ twoFactorAuthType } />
		</>
	);
};

export default LoginButtons;
