import {
	AppleLoginButton,
	GoogleSocialButton,
	GithubSocialButton,
	MagicLoginButton,
	QrCodeLoginButton,
} from './';

type LastUsedSocialButtonProps = {
	lastUsedAuthenticationMethod: string;
	loginUrl?: string;
	handleLogin?: ( result: Record< string, string > ) => void;
	onClick?: () => void;
	socialServiceResponse?: any;
};

const LastUsedSocialButton = ( {
	lastUsedAuthenticationMethod,
	loginUrl,
	handleLogin,
	onClick,
	socialServiceResponse,
}: LastUsedSocialButtonProps ) => {
	if ( ! lastUsedAuthenticationMethod ) {
		return null;
	}

	// Render the single social button based on the last used social login method
	switch ( lastUsedAuthenticationMethod ) {
		case 'google':
			return (
				handleLogin && (
					<GoogleSocialButton responseHandler={ handleLogin } onClick={ onClick } isLogin />
				)
			);

		case 'apple':
			return (
				handleLogin && (
					<AppleLoginButton
						responseHandler={ handleLogin }
						onClick={ onClick }
						socialServiceResponse={ socialServiceResponse }
						isLogin
					/>
				)
			);

		case 'github':
			return (
				handleLogin && (
					<GithubSocialButton
						socialServiceResponse={ socialServiceResponse }
						responseHandler={ handleLogin }
						onClick={ onClick }
						isLogin
					/>
				)
			);

		case 'magic-login':
			return loginUrl && <MagicLoginButton loginUrl={ loginUrl } />;

		case 'qr-code':
			return loginUrl && <QrCodeLoginButton loginUrl={ loginUrl } />;

		default:
			return null;
	}
};

export default LastUsedSocialButton;
