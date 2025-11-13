import { MouseEvent, ReactNode } from 'react';
import SocialLoginButton, {
	ExchangeCodeForTokenResponse,
} from 'calypso/components/social-buttons/social-login-button';
import GitHubIcon from 'calypso/components/social-icons/github';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type Props = {
	children?: ReactNode;
	onClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
	isLogin: boolean;
	responseHandler: ( response: ExchangeCodeForTokenResponse ) => void;
};

export const GitHubLoginButton = ( { children, onClick, isLogin, responseHandler }: Props ) => {
	return (
		<SocialLoginButton
			service="github"
			label="GitHub"
			icon={ ( { isDisabled } ) => <GitHubIcon isDisabled={ isDisabled } /> }
			isLogin={ isLogin }
			responseHandler={ responseHandler }
			onClick={ ( e, redirectUri ) => {
				onClick?.( e );

				const scope = encodeURIComponent( 'read:user,user:email' );
				window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize?redirect_uri=${ redirectUri }&scope=${ scope }&ux_mode=redirect`;
			} }
			children={ children }
		/>
	);
};

export default GitHubLoginButton;
