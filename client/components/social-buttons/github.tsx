import { MouseEvent } from 'react';
import SocialLoginButton, {
	SocialLoginButtonProps,
} from 'calypso/components/social-buttons/social-login-button';
import GitHubIcon from 'calypso/components/social-icons/github';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type Props = Omit< SocialLoginButtonProps, 'service' | 'label' | 'icon' | 'onClick' > & {
	onClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
};

export const GitHubLoginButton = ( { onClick, ...rest }: Props ) => {
	return (
		<SocialLoginButton
			service="github"
			label="GitHub"
			icon={ ( { isDisabled } ) => <GitHubIcon isDisabled={ isDisabled } /> }
			onClick={ ( e, redirectUri ) => {
				onClick?.( e );

				const scope = encodeURIComponent( 'read:user,user:email' );
				window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize?redirect_uri=${ redirectUri }&scope=${ scope }&ux_mode=redirect`;
			} }
			{ ...rest }
		/>
	);
};

export default GitHubLoginButton;
