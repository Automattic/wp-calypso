import {
	AppleLoginButton,
	GoogleSocialButton,
	GithubSocialButton,
	MagicLoginButton,
	QrCodeLoginButton,
	UsernameOrEmailButton,
} from './';

type LastUsedSocialButtonProps = {
	lastUsedAuthenticationMethod: string;
	qrLoginLink?: string;
	magicLoginLink?: string;
	handleLogin?: ( result: Record< string, string > ) => void;
	onClick?: any;
	socialServiceResponse?: any;
};

const LastUsedSocialButton = ( {
	lastUsedAuthenticationMethod,
	qrLoginLink,
	magicLoginLink,
	handleLogin,
	onClick,
	socialServiceResponse,
}: LastUsedSocialButtonProps ) => {
	// Render the single social button based on the last used social login method
	switch ( lastUsedAuthenticationMethod ) {
		case 'google':
			if ( ! handleLogin ) {
				return null;
			}

			return <GoogleSocialButton responseHandler={ handleLogin } onClick={ onClick } isLogin />;

		case 'apple':
			if ( ! handleLogin || ! onClick ) {
				return null;
			}

			return (
				<AppleLoginButton
					responseHandler={ handleLogin }
					onClick={ onClick }
					socialServiceResponse={ socialServiceResponse }
					isLogin
				/>
			);

		case 'github':
			if ( ! handleLogin ) {
				return null;
			}

			return (
				<GithubSocialButton
					socialServiceResponse={ socialServiceResponse }
					responseHandler={ handleLogin }
					onClick={ onClick }
					isLogin
				/>
			);

		case 'magic':
			if ( ! magicLoginLink ) {
				return null;
			}

			return <MagicLoginButton loginUrl={ magicLoginLink } />;

		case 'qrCode':
			if ( ! qrLoginLink ) {
				return null;
			}

			return <QrCodeLoginButton loginUrl={ qrLoginLink } />;

		case 'usernameOrEmail':
			return <UsernameOrEmailButton onClick={ onClick } />;

		default:
			return null;
	}
};

export default LastUsedSocialButton;
