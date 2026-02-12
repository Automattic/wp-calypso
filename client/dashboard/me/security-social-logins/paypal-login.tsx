import { addQueryArgs } from '@wordpress/url';
import OAuth2Login, { OAuth2LoginProps } from './oauth2-login';

type Props = Omit< OAuth2LoginProps, 'service' | 'label' | 'onClick' >;

export default function PayPalLogin( { ...rest }: Props ) {
	return (
		<OAuth2Login
			service="paypal"
			label="PayPal"
			onClick={ ( e, redirectUri ) => {
				window.location.href = addQueryArgs(
					'https://public-api.wordpress.com/wpcom/v2/hosting/paypal/app-authorize',
					{
						redirect_uri: redirectUri,
						ux_mode: 'redirect',
					}
				);
			} }
			{ ...rest }
		/>
	);
}
