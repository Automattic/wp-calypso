import { addQueryArgs } from '@wordpress/url';
import OAuth2Login, { OAuth2LoginProps } from './oauth2-login';

type GitHubLoginProps = Omit< OAuth2LoginProps, 'service' | 'label' | 'onClick' >;

export default function GitHubLogin( { ...rest }: GitHubLoginProps ) {
	return (
		<OAuth2Login
			service="github"
			label="GitHub"
			onClick={ ( e, redirectUri ) => {
				window.location.href = addQueryArgs(
					'https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize',
					{
						redirect_uri: redirectUri,
						scope: encodeURIComponent( 'read:user,user:email' ),
						ux_mode: 'redirect',
					}
				);
			} }
			{ ...rest }
		/>
	);
}
