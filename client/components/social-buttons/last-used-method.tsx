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

		case 'qr':
			return loginUrl && <QrCodeLoginButton loginUrl={ loginUrl } />;

		case 'usernameOrEmail':
			return onClick && <UsernameOrEmailButton onClick={ onClick } />;

		default:
			return null;
	}
};

export default LastUsedSocialButton;
