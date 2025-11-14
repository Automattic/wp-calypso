import { MouseEvent } from 'react';
import SocialLoginButton, {
	SocialLoginButtonProps,
} from 'calypso/components/social-buttons/social-login-button';
import PayPalIcon from 'calypso/components/social-icons/paypal';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type Props = Omit< SocialLoginButtonProps, 'service' | 'label' | 'icon' | 'onClick' > & {
	onClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
};

export const PayPalLoginButton = ( { onClick, ...rest }: Props ) => {
	return (
		<SocialLoginButton
			service="paypal"
			label="PayPal"
			icon={ ( { isDisabled } ) => <PayPalIcon isDisabled={ isDisabled } /> }
			onClick={ ( e, redirectUri ) => {
				onClick?.( e );

				window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/paypal/app-authorize?redirect_uri=${ redirectUri }&ux_mode=redirect`;
			} }
			{ ...rest }
		/>
	);
};

export default PayPalLoginButton;
